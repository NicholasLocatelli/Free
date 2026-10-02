/**
 * Recovery categories. The engine never branches on a category id: everything that
 * differs between categories (milestones, triggers, money support) is data declared here.
 * Only `gambling` is available in the MVP; the others document the extension point.
 */
export type CategoryId = "gambling" | "alcohol" | "smoking" | "gaming" | "social_media" | "other";

export type CategoryStatus = "available" | "planned";

export interface RecoveryCategory {
  id: CategoryId;
  /** i18n key, e.g. `category.gambling.name`. UI copy never lives in the domain. */
  nameKey: string;
  descriptionKey: string;
  /** Icon token resolved by the design system, never a brand or gambling symbol. */
  icon: string;
  status: CategoryStatus;
  defaultMilestoneHours: readonly number[];
  supportsMoneyEstimate: boolean;
  /** Trigger tags offered in the urge tracker (i18n key suffixes). */
  triggerTags: readonly string[];
  /** Coping action tags offered in the urge tracker (i18n key suffixes). */
  copingActionTags: readonly string[];
}

export const DEFAULT_MILESTONE_HOURS: readonly number[] = [
  24, // 1 day
  72, // 3 days
  168, // 7 days
  336, // 14 days
  720, // 30 days
  1_440, // 60 days
  2_160, // 90 days
  4_320, // 180 days
  8_760, // 365 days
];

const COMMON_COPING_ACTIONS = [
  "breathing",
  "waited_it_out",
  "called_someone",
  "went_outside",
  "physical_activity",
  "distraction",
  "other",
] as const;

const gambling: RecoveryCategory = {
  id: "gambling",
  nameKey: "category.gambling.name",
  descriptionKey: "category.gambling.description",
  icon: "compass",
  status: "available",
  defaultMilestoneHours: DEFAULT_MILESTONE_HOURS,
  supportsMoneyEstimate: true,
  triggerTags: [
    "boredom",
    "stress",
    "loneliness",
    "money_available",
    "sports_event",
    "advertising",
    "alcohol",
    "conflict",
    "celebration",
    "other",
  ],
  copingActionTags: [...COMMON_COPING_ACTIONS, "used_blocker"],
};

const planned = (
  id: CategoryId,
  icon: string,
  supportsMoneyEstimate: boolean,
): RecoveryCategory => ({
  id,
  nameKey: `category.${id}.name`,
  descriptionKey: `category.${id}.description`,
  icon,
  status: "planned",
  defaultMilestoneHours: DEFAULT_MILESTONE_HOURS,
  supportsMoneyEstimate,
  triggerTags: ["boredom", "stress", "loneliness", "other"],
  copingActionTags: COMMON_COPING_ACTIONS,
});

export const CATEGORIES: Readonly<Record<CategoryId, RecoveryCategory>> = {
  gambling,
  alcohol: planned("alcohol", "leaf", true),
  smoking: planned("smoking", "wind", true),
  gaming: planned("gaming", "moon", false),
  social_media: planned("social_media", "sun", false),
  other: planned("other", "circle", false),
};

export function getCategory(id: CategoryId): RecoveryCategory {
  return CATEGORIES[id];
}

export function availableCategories(): RecoveryCategory[] {
  return Object.values(CATEGORIES).filter((c) => c.status === "available");
}
