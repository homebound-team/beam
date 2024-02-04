/**
 * What's the goal?
 *
 * We want our SelectField to only conditionally require the `getOptionValue`
 * and `getOptionLabel` keys.
 *
 * The idea is that if the `O` matches ~a few known shapes (it has an `id` key, or
 * it has a `name` or `displayName` key), we'll use default impls of `getOptionValue`
 * and `getOptionLabel`.
 *
 * Historically, we did this with function overloads, but it gets really verbose to do
 * every combination, so we just have a single "does O extend HasIdAndName" that drives
 * both keys, and call it good. We'd like to require each key separately, which requires
 * four overloads:
 *
 * - `O` extends `HasId` and `HasName`, both `getOptionValue` and `getOptionLabel` are optionals
 * - `O` extends `HasId` only, only `getOptionValue` is optional
 * - `O` extends `HasName` only, only `getOptionLabel` is optional
 * - `O` extends neither, neither `getOptionValue` and `getOptionLabel` are optionals
 *
 * So it seemed like a good idea to drive the conditionalism from within the Props type itself.
 *
 * This generally works for callers directly calling SelectField, but if components want to wrap
 * SelectField, and have props that extends the SelectFieldProps, that works, until internally when
 * the wrapper does `{ extra, ...rest } = props`, and then tries to call SelectField with `rest`,
 * rest has lost the notion that it matches the conditional type.
 */

// Conditionally require a key based on the generic
export type MaybeGetOptionValue<O, V> = O extends { id: V }
  ? { getOptionValue?: (opt: O) => V }
  : { getOptionValue: (opt: O) => V };

// Define props + component with conditional key
export type SelectProps<O, V> = { options: O[] } & MaybeGetOptionValue<O, V>;
function Select<O, V>(props: SelectProps<O, V>) {
  return null;
}

// Show it works when using Select directly
const options = [
  { id: "1", name: "one" },
  { id: "2", name: "two" },
];
const t = <Select options={options} />;

type Select2Props<O, V> = SelectProps<O, V> & { extra: string };

function Select2<O, V>(props: Select2Props<O, V>) {
  const { extra, ...rest } = props;
  // return Select(props); // works b/c MaybeGetOptionValue-ism is preserved
  // return Select(rest); // broken b/c spread lots MaybeGetOptionValue-ism
  return <Select {...rest} />; // broken b/c spread
}
