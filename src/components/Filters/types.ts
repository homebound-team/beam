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
export type FilterDefs<F> = {
  // Filter values can still be `null | undefined`, but extract it out for clarity in `FilterDef`
  [K in keyof F]: (key: string) => Filter<Exclude<F[K], null | undefined>>;
};

// Like FilterDefs but with the key lambda eval'd, i.e. values are the actual Filter instance
export type FilterImpls<F> = {
  // Filter values can still be `null | undefined`, but extract it out for clarity in `FilterDef`
  [K in keyof F]: Filter<Exclude<F[K], null | undefined>>;
};

/** A filter instance that knows how to render itself within the `Filters` component. */
export interface Filter<V> {
  label: string;

  hideLabelInModal?: boolean;

  /** The default value to use in `usePersistedFilter` for creating the initial filter. */
  defaultValue: V | undefined;

  /** Renders the filter into either the page or the modal. */
  render(value: V | undefined, setValue: (value: V | undefined) => void, tid: TestIds, inModal: boolean): JSX.Element;
}
