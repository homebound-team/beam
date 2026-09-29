/** Compares own values of arrays and plain objects, and members of Maps and Sets. */
export function shallowEqual(objA: unknown, objB: unknown): boolean {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }

  if (objA instanceof Map || objB instanceof Map) {
    if (!(objA instanceof Map && objB instanceof Map) || objA.size !== objB.size) return false;

    for (const [key, value] of objA) {
      if (!objB.has(key) || !Object.is(value, objB.get(key))) return false;
    }
    return true;
  }

  if (objA instanceof Set || objB instanceof Set) {
    if (!(objA instanceof Set && objB instanceof Set) || objA.size !== objB.size) return false;

    for (const value of objA) {
      if (!objB.has(value)) return false;
    }
    return true;
  }

  // Other objects can hide their state outside enumerable keys (e.g. Date).
  if (Array.isArray(objA) !== Array.isArray(objB)) return false;
  if (!Array.isArray(objA) && (!isPlainObject(objA) || !isPlainObject(objB))) return false;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i];
    if (
      !Object.prototype.hasOwnProperty.call(objB, currentKey) ||
      !Object.is((objA as Record<string, unknown>)[currentKey], (objB as Record<string, unknown>)[currentKey])
    ) {
      return false;
    }
  }

  return true;
}

/** Allows ordinary objects (including null-prototype records) to use shallow own-key comparison. */
function isPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
