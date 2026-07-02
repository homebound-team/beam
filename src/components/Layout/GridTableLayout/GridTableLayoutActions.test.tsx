import { useState } from "react";
import type { FilterDefs } from "src/components/Filters";
import { checkboxFilter } from "src/components/Filters";
import { click, render, withRouter } from "src/utils/rtl";
import { typeAndWait } from "src/utils/rtlUtils";
import { vi } from "vitest";
import { GridTableLayoutActions } from "./GridTableLayoutActions";

type TestFilter = { needsRevision?: boolean };
const filterDefs: FilterDefs<TestFilter> = {
  needsRevision: checkboxFilter({ label: "Needs Revision" }),
};

describe("GridTableLayoutActions", () => {
  describe("search", () => {
    it("renders the search field when searchProps is provided", async () => {
      // Given searchProps is provided
      const r = await render(<GridTableLayoutActions searchProps={{ onSearch: vi.fn() }} />, withRouter());
      // Then the search field is shown
      expect(r.search).toBeInTheDocument();
    });

    it("does not render the search field when searchProps is not provided", async () => {
      // Given no searchProps
      const r = await render(<GridTableLayoutActions />, withRouter());
      // Then the search field is not shown
      expect(r.query.search).not.toBeInTheDocument();
    });

    it("calls onSearch after typing a value", async () => {
      // Given the search field is rendered
      const onSearch = vi.fn();
      const r = await render(<GridTableLayoutActions searchProps={{ onSearch }} />, withRouter());
      // When the user types a value
      await typeAndWait(r.search, "alpha");
      // Then onSearch is called with the typed value
      expect(onSearch).toHaveBeenCalledWith("alpha");
    });
  });

  describe("filters", () => {
    it("shows the filter button when filterDefs is provided", async () => {
      // Given filterDefs is provided
      const r = await render(
        <GridTableLayoutActions filterDefs={filterDefs} filter={{}} setFilter={vi.fn()} />,
        withRouter(),
      );
      // Then the filter button is shown
      expect(r.gridTableLayoutActions_filterButton).toBeInTheDocument();
    });

    it("does not show the filter button when filterDefs is not provided", async () => {
      // Given no filterDefs
      const r = await render(<GridTableLayoutActions />, withRouter());
      // Then the filter button is not shown
      expect(r.query.filter_filterButton).not.toBeInTheDocument();
    });

    it("opens the filter panel on filter button click and closes it on a second click", async () => {
      // Given the panel is closed with an active filter
      function Wrapper() {
        const [filter, setFilter] = useState<TestFilter>({ needsRevision: true });
        return <GridTableLayoutActions filterDefs={filterDefs} filter={filter} setFilter={setFilter} />;
      }
      const r = await render(<Wrapper />, withRouter());
      expect(r.filter_chip_needsRevision).toBeInTheDocument();

      // When the filter button is clicked
      click(r.gridTableLayoutActions_filterButton);
      // Then the panel opens and chips are hidden
      expect(r.query.filter_chip_needsRevision).not.toBeInTheDocument();

      // When the filter button is clicked again
      click(r.gridTableLayoutActions_filterButton);
      // Then the panel closes and chips reappear
      expect(r.filter_chip_needsRevision).toBeInTheDocument();
    });

    it("calls setFilter with empty object when Clear is clicked in an open panel", async () => {
      // Given the panel is closed with an active filter
      const setFilter = vi.fn();
      const r = await render(
        <GridTableLayoutActions filterDefs={filterDefs} filter={{ needsRevision: true }} setFilter={setFilter} />,
        withRouter(),
      );
      // When the panel is opened and Clear is clicked
      click(r.gridTableLayoutActions_filterButton);
      click(r.filter_clearBtn);
      // Then setFilter is called with an empty object
      expect(setFilter).toHaveBeenCalledWith({});
    });
  });
});
