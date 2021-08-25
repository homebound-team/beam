/**
 * Provides a way to easily generate `data-testid`s.
 *
 * The test ids are made of a `prefix` + `_` + `key`, where:
 *
 * - The prefix is the component name, like "profile", and
 * - The key is the specific DOM element that's being tagged, like "firstName"
 *
 * To determine the prefix, the component passes us their props, which we'll use
 * to look for an incoming `data-testid` to become the prefix the `data-testid`s
 * that we create. I.e.:
 *
 * ```tsx
 * const { a, b } = props;
 * const testIds = useTestIds(props);
 *
 * return <Foo {...testIds.foo />;
 * ```
 *
 * This allows components that embed the component to customize the prefix, i.e.
 * `<TextField data-testid="firstName" />` and `<TextField data-testid="lastName" />`
 * would produce, within `TextField` itself, ids like:
 *
 * - `firstName_input`
 * - `firstName_errors`
 * - `lastName_input`
 * - `lastName_errors`
 * - etc
 */
import { defaultTestId } from "src/utils/defaultTestId";

export function useTestIds(props: object, defaultPrefix?: string): Record<string, object> {
  const prefix: string | undefined =
    (props as any)["data-testid"] ||
    // Pass defaultPrefix through defaultTestId to allow `useTestIds(..., label)` usage
    (defaultPrefix ? defaultTestId(defaultPrefix) : undefined);
  const rootId = { "data-testid": prefix };
  return newMethodMissingProxy(rootId, (key) => {
    // If we get tagged ids, remove the colon so that we can do `r.foo_m2` for `m:2`
    key = key.replace(":", "");
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
