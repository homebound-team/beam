import { act } from "@testing-library/react";
import { useState } from "react";
import type { FilterDefs } from "src/components/Filters";
import { checkboxFilter } from "src/components/Filters";
import { change, click, render, withRouter } from "src/utils/rtl";
import { vi } from "vitest";
import { GridTableLayoutActions } from "./GridTableLayoutActions";

type TestFilter = { needsRevision?: boolean };
const filterDefs: FilterDefs<TestFilter> = {
  needsRevision: checkboxFilter({ label: "Needs Revision" }),
};

describe("GridTableLayoutActions", () => {
  describe("search", () => {
    it("renders the search field when searchProps is provided", async () => {
      const r = await render(<GridTableLayoutActions searchProps={{ onSearch: vi.fn() }} />, withRouter());
      expect(r.search).toBeInTheDocument();
    });

    it("does not render the search field when searchProps is not provided", async () => {
      const r = await render(<GridTableLayoutActions />, withRouter());
      expect(r.query.search).not.toBeInTheDocument();
    });

    it("calls onSearch on mount with the initial search value", async () => {
      const onSearch = vi.fn();
      await render(<GridTableLayoutActions searchProps={{ onSearch }} />, withRouter());
      expect(onSearch).toHaveBeenCalledWith("");
    });

    it("calls onSearch after typing a value", async () => {
      const onSearch = vi.fn();
      const r = await render(<GridTableLayoutActions searchProps={{ onSearch }} />, withRouter());
      change(r.search, "alpha");
      act(() => vi.advanceTimersByTime(300));
      expect(onSearch).toHaveBeenCalledWith("alpha");
    });
  });

  describe("filters", () => {
    it("shows the filter button when filterDefs is provided", async () => {
      const r = await render(
        <GridTableLayoutActions filterDefs={filterDefs} filter={{}} setFilter={vi.fn()} />,
        withRouter(),
      );
      expect(r.gridTableLayoutActions_filterButton).toBeInTheDocument();
    });

    it("does not show the filter button when filterDefs is not provided", async () => {
      const r = await render(<GridTableLayoutActions />, withRouter());
      expect(r.query.filter_filterButton).not.toBeInTheDocument();
    });

    it("opens the filter panel on filter button click and closes it on a second click", async () => {
      function Wrapper() {
        const [filter, setFilter] = useState<TestFilter>({ needsRevision: true });
        return <GridTableLayoutActions filterDefs={filterDefs} filter={filter} setFilter={setFilter} />;
      }
      const r = await render(<Wrapper />, withRouter());

      // Initially closed: chips are visible
      expect(r.filter_chip_needsRevision).toBeInTheDocument();

      // Open the panel
      click(r.gridTableLayoutActions_filterButton);
      expect(r.query.filter_chip_needsRevision).not.toBeInTheDocument();

      // Close the panel
      click(r.gridTableLayoutActions_filterButton);
      expect(r.filter_chip_needsRevision).toBeInTheDocument();
    });

    it("calls setFilter with empty object when Clear is clicked in an open panel", async () => {
      const setFilter = vi.fn();
      const r = await render(
        <GridTableLayoutActions filterDefs={filterDefs} filter={{ needsRevision: true }} setFilter={setFilter} />,
        withRouter(),
      );

      click(r.gridTableLayoutActions_filterButton);
      click(r.filter_clearBtn);
      expect(setFilter).toHaveBeenCalledWith({});
    });
  });
});
