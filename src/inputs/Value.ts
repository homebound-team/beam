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

export function keyToValue<V extends Value>(key: Key): V {
  if (typeof key === "number") {
    // react-aria's selection manager always returns strings, so we probably
    // won't actually hit this line, but just in case.
    return key as V;
  } else if (typeof key === "string") {
    if (key === "__VALUE:null") {
      return null as V;
    } else if (key === "__VALUE:undefined") {
      return undefined as V;
    } else if (key.startsWith("__VALUE:boolean:")) {
      // boolean values end with `;` (i.e. '__VALUE:boolean:true;').
      return key.split(":")[2].startsWith("true") as V;
    } else if (key.startsWith("__VALUE:number")) {
      return Number(key.split(":")[2]) as V;
    } else {
      return key as V;
    }
  } else {
    throw new Error(`Unsupported key ${key}`);
  }
}

export function valueToKey(value: Value): Key {
  if (typeof value === "string") {
    return value;
  } else if (typeof value === "number") {
    // Despite using the Key type, react-aria's select manager always returns strings,
    // so tag this value as really being a number.
    return `__VALUE:number:${value}`;
  } else if (typeof value === "boolean") {
    return `__VALUE:boolean:${value};`;
  } else if (value === null) {
    return "__VALUE:null";
  } else if (value === undefined) {
    return "__VALUE:undefined";
  } else {
    throw new Error(`Unsupported value ${value}`);
  }
}
