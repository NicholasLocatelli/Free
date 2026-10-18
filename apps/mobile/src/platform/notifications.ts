import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { PlannedNotification } from "../features/reminders/reminderPlan";

export type PermissionState = "granted" | "denied" | "undetermined";

/** The only notification surface the app uses: local, scheduled on the device. */
export interface ReminderScheduler {
  getPermission(): Promise<PermissionState>;
  requestPermission(): Promise<PermissionState>;
  /** Replaces every scheduled notification with `planned`. */
  replaceAll(planned: readonly PlannedNotification[]): Promise<void>;
}

const CHANNEL_ID = "reminders";

const toState = (status: Notifications.PermissionStatus): PermissionState =>
  status === Notifications.PermissionStatus.GRANTED
    ? "granted"
    : status === Notifications.PermissionStatus.DENIED
      ? "denied"
      : "undetermined";

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Promemoria",
    importance: Notifications.AndroidImportance.DEFAULT,
    // Content stays hidden on a secure lock screen until the device is unlocked.
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
    showBadge: false,
  });
}

export function createExpoReminderScheduler(): ReminderScheduler {
  return {
    async getPermission() {
      return toState((await Notifications.getPermissionsAsync()).status);
    },
    async requestPermission() {
      return toState((await Notifications.requestPermissionsAsync()).status);
    },
    async replaceAll(planned) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (planned.length === 0) return;
      await ensureAndroidChannel();
      for (const item of planned) {
        await Notifications.scheduleNotificationAsync({
          identifier: item.id,
          content: { title: item.title, body: item.body, sound: false },
          trigger:
            item.kind === "check-in"
              ? {
                  type: Notifications.SchedulableTriggerInputTypes.DAILY,
                  hour: item.hour,
                  minute: item.minute,
                  channelId: CHANNEL_ID,
                }
              : {
                  type: Notifications.SchedulableTriggerInputTypes.DATE,
                  date: item.at,
                  channelId: CHANNEL_ID,
                },
        });
      }
    },
  };
}
