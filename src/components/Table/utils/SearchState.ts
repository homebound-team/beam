import { makeAutoObservable, observable } from "mobx";

/**
 * Stores the current client-side type-ahead search/filter.
 *
 * We store this as a very tiny/dedicated observable, to simplify
 * the dependencies we pass into each RowState to calc it's
 * matched-ness.
 */
export class SearchState {
  search: string[] = [];

  constructor() {
    makeAutoObservable(this, { search: observable.ref });
  }

  setSearch(search: string | undefined) {
    // Break up "foo bar" into `[foo, bar]` and a row must match both `foo` and `bar`
    this.search = (search && search.split(/ +/)) || [];
  }
}
