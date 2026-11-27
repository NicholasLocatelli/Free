import { hasMessage, t } from "./index";

/** Translated label for a tag id declared by a recovery category in @free/core. */
export function tagLabel(tag: string): string {
  const key = `tag.${tag}`;
  return hasMessage(key) ? t(key) : tag;
}
