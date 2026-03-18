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

export function clearInlineStyles(el: HTMLElement, styles: object): void {
  Object.entries(styles as Record<string, unknown>).forEach(([prop, value]) => {
    if (!isInlineStyleValue(value)) return;
    if (prop.startsWith("--")) {
      el.style.removeProperty(prop);
    } else {
      (el.style as any)[prop] = "";
    }
  });
}
