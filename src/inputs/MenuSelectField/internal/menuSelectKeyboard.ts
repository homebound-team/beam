import type { Key } from "@react-types/shared";
import { ListKeyboardDelegate } from "react-aria";

/** Page keys step the collection. Measuring the DOM under-counts a virtualized list. */
export class MenuSelectKeyboardDelegate<T> extends ListKeyboardDelegate<T> {
  override getKeyPageBelow(key: Key): Key | null {
    return stepKeys(this, key, pageSize, "below");
  }

  override getKeyPageAbove(key: Key): Key | null {
    return stepKeys(this, key, pageSize, "above");
  }
}

/** Rows skipped by PageUp / PageDown. */
const pageSize = 10;

function stepKeys<T>(
  delegate: ListKeyboardDelegate<T>,
  key: Key,
  count: number,
  direction: "below" | "above",
): Key | null {
  let next: Key | null = key;
  for (let index = 0; index < count; index += 1) {
    if (next == null) return next;
    const candidate: Key | null = direction === "below" ? delegate.getKeyBelow(next) : delegate.getKeyAbove(next);
    if (candidate == null) return next;
    next = candidate;
  }
  return next;
}
