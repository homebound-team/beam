import { TestIds } from "src/utils/useTestIds";

/**
 * Defines the filters for a given filter type `F`.
 *
 * Generally `F` will be a GraphQL filter type i.e. `BillFilter`, but it can also
 * be an adaption or even completely custom type to match the UX for the given page.
 *
 * Each filter is typically created by a factory function, i.e. `singleFilter`,
 * `multiFilter`, etc.
 */
/** A set filter field value — null and undefined excluded (matches the `V` in `Filter<V>` for that field). */
export type DefinedFilterValue<F, K extends keyof F> = Exclude<F[K], null | undefined>;

export type FilterDefs<F> = {
  // Filter values can still be `null | undefined`, but extract it out for clarity in `FilterDef`
  [K in keyof F]: (key: string) => Filter<DefinedFilterValue<F, K>>;
};

// Like FilterDefs but with the key lambda eval'd, i.e. values are the actual Filter instance
export type FilterImpls<F> = {
  // Filter values can still be `null | undefined`, but extract it out for clarity in `FilterDef`
  [K in keyof F]: Filter<DefinedFilterValue<F, K>>;
};

/** Value shape passed when resolving a display label for one active selection (array filters: a single element). */
export type SelectedFilterLabelValue<V> = V extends readonly (infer E)[] ? E : V;

/** A filter instance that knows how to render itself within the `Filters` component. */
export type Filter<V> = {
  label: string;

  hideLabelInModal?: boolean;

  /** The default value to use in `usePersistedFilter` for creating the initial filter. */
  defaultValue: V | undefined;

  /**
   * Rehydrates persisted query/session values back into the filter's runtime shape.
   *
   * This exists because persisted filter state is JSON-based, so rich values like
   * `Temporal.PlainDate` round-trip as strings and need explicit reconstruction.
   */
  hydrate?(value: unknown): V | undefined;

  /**
   * Converts the filter's runtime value into a JSON-safe value for query params/session storage.
   *
   * This keeps persistence stable for non-plain JS values and lets filters preserve
   * backwards-compatible serialized formats when needed.
   */
  dehydrate?(value: V | undefined): unknown;

  /** Returns the human-readable label for an active filter value, or undefined when the value should not produce a chip. */
  formatSelectedFilterLabel(value: SelectedFilterLabelValue<V>): string | undefined;

  /** Renders the filter into either the page or the modal. */
  render(
    value: V | undefined,
    setValue: (value: V | undefined) => void,
    tid: TestIds,
    inModal: boolean,
    vertical: boolean,
  ): JSX.Element;
};
