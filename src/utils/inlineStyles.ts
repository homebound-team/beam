function isInlineStyleValue(value: unknown): value is string | number {
  return typeof value === "string" || typeof value === "number";
}

export function setInlineStyles(el: HTMLElement, styles: object): void {
  Object.entries(styles as Record<string, unknown>).forEach(([prop, value]) => {
    if (!isInlineStyleValue(value)) return;
    if (prop.startsWith("--")) {
      el.style.setProperty(prop, String(value));
    } else {
      (el.style as any)[prop] = String(value);
    }
  });
}

export type ElementStyleSnapshot = { style: string; className: string };

/** Captures an element's current `style` attribute and `className`, for later restoration via `restoreElementStyle`. */
export function snapshotElementStyle(el: HTMLElement): ElementStyleSnapshot {
  return { style: el.getAttribute("style") ?? "", className: el.className };
}

/** Restores an element's `style` attribute and `className` to a prior `snapshotElementStyle` capture. */
export function restoreElementStyle(el: HTMLElement, snapshot: ElementStyleSnapshot): void {
  if (snapshot.style) {
    el.setAttribute("style", snapshot.style);
  } else {
    el.removeAttribute("style");
  }
  el.className = snapshot.className;
}
