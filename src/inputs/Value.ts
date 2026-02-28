import { Key } from "react";

/**
 * The values we support in select fields.
 *
 * react-aria's selectionManager is really picky about only knowing about
 * `string`s or `number`s (basically `Key` from react) for what it can track
 * as "is currently selected".
 *
 * This is pretty constricting, so we loosen this to be a few more primitives
 * that we can deterministically convert back/forth.
 *
 * TODO: ...could we just use the option index value as the key, and call that
 * good? I.e. selection state would just be "these indexes are currently selected".
 */
export type Value = string | number | null | undefined | boolean;

// react-aria v3.33+ uses keys in element IDs (e.g. `${id}-option-${key}`) and
// `data-key` attributes; colons in keys produce invalid CSS selectors in jsdom's
// nwsapi when matching stylesheet rules. Use `--` as a separator instead.
const VALUE_PREFIX = "__VALUE--";

export function keyToValue<V extends Value>(key: Key): V {
  if (typeof key === "number") {
    // react-aria's selection manager always returns strings, so we probably
    // won't actually hit this line, but just in case.
    return key as V;
  } else if (typeof key === "string") {
    // Support both old (colon) and new (double-dash) separators for backward compatibility
    if (key === `${VALUE_PREFIX}null` || key === "__VALUE:null") {
      return null as V;
    } else if (key === `${VALUE_PREFIX}undefined` || key === "__VALUE:undefined") {
      return undefined as V;
    } else if (key.startsWith(`${VALUE_PREFIX}boolean--`) || key.startsWith("__VALUE:boolean:")) {
      const parts = key.includes("--boolean--") ? key.split("--") : key.split(":");
      return (parts[parts.length - 1] === "true") as V;
    } else if (key.startsWith(`${VALUE_PREFIX}number--`) || key.startsWith("__VALUE:number:")) {
      const parts = key.includes("--number--") ? key.split("--") : key.split(":");
      return Number(parts[parts.length - 1]) as V;
    } else {
      return key as V;
    }
  } else {
    throw new Error(`Unsupported key ${key}`);
  }
}

export function valueToKey(value: Value): string {
  if (typeof value === "string") {
    return value;
  } else if (typeof value === "number") {
    // Despite using the Key type, react-aria's select manager always returns strings,
    // so tag this value as really being a number.
    return `${VALUE_PREFIX}number--${value}`;
  } else if (typeof value === "boolean") {
    return `${VALUE_PREFIX}boolean--${value}`;
  } else if (value === null) {
    return `${VALUE_PREFIX}null`;
  } else if (value === undefined) {
    return `${VALUE_PREFIX}undefined`;
  } else {
    throw new Error(`Unsupported value ${value}`);
  }
}
