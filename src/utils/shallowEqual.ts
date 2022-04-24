/**
 * An inlined version of shallowEach, see https://github.com/facebook/react/issues/16919
 */
export function shallowEqual(objA: any, objB: any): boolean {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i];
    if (!objB.hasOwnProperty(currentKey) || !Object.is(objA[currentKey], objB[currentKey])) {
      return false;
    }
  }

  return true;
}
