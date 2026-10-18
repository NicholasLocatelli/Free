import type { PlannedNotification } from "../features/reminders/reminderPlan";
import type { PermissionState, ReminderScheduler } from "../platform/notifications";

/** In-memory scheduler: records what is scheduled and simulates the permission dialog. */
export function createFakeScheduler(answer: PermissionState = "granted") {
  let permission: PermissionState = "undetermined";
  const state = { scheduled: [] as PlannedNotification[], requests: 0, replaceCalls: 0 };
  const scheduler: ReminderScheduler = {
    getPermission: () => Promise.resolve(permission),
    requestPermission: () => {
      state.requests++;
      permission = answer;
      return Promise.resolve(permission);
    },
    replaceAll: (planned) => {
      state.replaceCalls++;
      state.scheduled = [...planned];
      return Promise.resolve();
    },
  };
  return { scheduler, state };
}
