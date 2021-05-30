/** Utility for debugging object identity/caching/memo issues. */
export const objectId = (() => {
  let currentId = 0;
  const map = new WeakMap();
  return (object: object): number => {
    if (!map.has(object)) {
      map.set(object, ++currentId);
    }
    return map.get(object)!;
  };
})();
