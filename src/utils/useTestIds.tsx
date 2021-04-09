/**
 * Provides a way to easily generate `data-testid`s.
 *
 * The caller gives us the `...others` from their props, which we'll use to
 * look for an incoming `data-testid` to become the prefix the `data-testid`s
 * that we generate for the caller.
 *
 * ```tsx
 * const { a, b, ...others } = props;
 * const testIds = useTestIds(props);
 *
 * return <Foo {...testIds.foo />;
 * ```
 */
export function useTestIds(props: object, defaultPrefix?: string): Record<string, object> {
  const prefix: string | undefined = (props as any)["data-testid"] || defaultPrefix;
  const rootId = { "data-testid": prefix };
  return newMethodMissingProxy(rootId, (key) => {
    return { "data-testid": prefix ? `${prefix}_${key}` : key };
  }) as any;
}

/** Uses `object` for any keys that exist on it, otherwise calls `methodMissing` fn. */
function newMethodMissingProxy<T extends object, Y>(
  object: T,
  methodMissing: (key: string) => Y,
): T & Record<string, Y> {
  return new Proxy(object, {
    get(object, property) {
      if (Reflect.has(object, property)) {
        return Reflect.get(object, property);
      } else if (property === "then") {
        return undefined;
      } else {
        return methodMissing(String(property));
      }
    },
  }) as any;
}
