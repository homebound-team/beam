import { useState } from "react";
import type { FilterDefs } from "src/components/Filters";
import { checkboxFilter, multiFilter } from "src/components/Filters";
import { setViewport } from "src/tests/viewport";
import { noop } from "src/utils";
import { click, render, withRouter } from "src/utils/rtl";
import { typeAndWait } from "src/utils/rtlUtils";
import { vi } from "vitest";
import { GridTableLayoutActions } from "./GridTableLayoutActions";

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
    it("renders a single filter inline on desktop without a Filter button or panel chips", async () => {
      // Given a single filter and no groupBy on desktop
      const r = await render(
        <GridTableLayoutActions filterDefs={createSingleFilterDefs()} filter={{}} setFilter={vi.fn()} />,
        withRouter(),
      );
      // Then the filter control is inline and the toggle / chips are not shown
      expect(r.filter_needsRevision).toBeInTheDocument();
      expect(r.query.gridTableLayoutActions_filterButton).toBeNull();
      expect(r.query.filter_chip_needsRevision).toBeNull();
      expect(r.query.filter_clearBtn).toBeNull();
    });

    it("renders groupBy inline on desktop when there are no filters", async () => {
      // Given groupBy only on desktop
      const r = await render(
        <GridTableLayoutActions
          groupBy={{
            value: "none",
            setValue: vi.fn(),
            options: [
              { id: "none", name: "None" },
              { id: "status", name: "Status" },
            ],
          }}
        />,
        withRouter(),
      );
      // Then groupBy is inline and the Filter toggle is not shown
      expect(r.groupBy).toBeInTheDocument();
      expect(r.query.gridTableLayoutActions_filterButton).toBeNull();
    });

    it("shows the Filter button when groupBy and filters are nested", async () => {
      // Given groupBy plus filters on desktop
      const r = await render(
        <GridTableLayoutActions
          filterDefs={createSingleFilterDefs()}
          filter={{}}
          setFilter={vi.fn()}
          groupBy={{
            value: "none",
            setValue: vi.fn(),
            options: [
              { id: "none", name: "None" },
              { id: "status", name: "Status" },
            ],
          }}
        />,
        withRouter(),
      );
      // Then the Filter toggle is shown and controls are not inline until opened
      expect(r.gridTableLayoutActions_filterButton).toBeInTheDocument();
      expect(r.query.filter_needsRevision).toBeNull();
      expect(r.query.groupBy).toBeNull();

      // When the Filter button is clicked
      click(r.gridTableLayoutActions_filterButton);
      // Then groupBy and the filter are nested in the open panel
      expect(r.groupBy).toBeInTheDocument();
      expect(r.filter_needsRevision).toBeInTheDocument();
    });

    it("does not show the filter button when filterDefs and groupBy are not provided", async () => {
      // Given no filterDefs or groupBy
      const r = await render(<GridTableLayoutActions />, withRouter());
      // Then the filter button is not shown
      expect(r.query.gridTableLayoutActions_filterButton).toBeNull();
    });

    it("opens the filter panel on filter button click and closes it on a second click", async () => {
      // Given multiple filters with an active filter on desktop
      function Wrapper() {
        const [filter, setFilter] = useState<MultiFilter>({ needsRevision: true });
        return <GridTableLayoutActions filterDefs={createMultiFilterDefs()} filter={filter} setFilter={setFilter} />;
      }
      const r = await render(<Wrapper />, withRouter());
      expect(r.filter_chip_needsRevision).toBeInTheDocument();

      // When the filter button is clicked
      click(r.gridTableLayoutActions_filterButton);
      // Then the panel opens and chips are hidden
      expect(r.query.filter_chip_needsRevision).toBeNull();
      expect(r.filter_needsRevision).toBeInTheDocument();

      // When the filter button is clicked again
      click(r.gridTableLayoutActions_filterButton);
      // Then the panel closes and chips reappear
      expect(r.filter_chip_needsRevision).toBeInTheDocument();
    });

    it("calls clearFilters when Clear is clicked in an open panel", async () => {
      // Given multiple filters with an active filter on desktop
      const clearFilters = vi.fn();
      const r = await render(
        <GridTableLayoutActions
          filterDefs={createMultiFilterDefs()}
          filter={{ needsRevision: true }}
          setFilter={vi.fn()}
          clearFilters={clearFilters}
        />,
        withRouter(),
      );
      // When the panel is opened and Clear is clicked
      click(r.gridTableLayoutActions_filterButton);
      click(r.filter_clearBtn);
      // Then clearFilters is called
      expect(clearFilters).toHaveBeenCalled();
    });

    it("toggles the filter panel from the icon button on mobile for a single filter", async () => {
      // Given a single filter on mobile
      setViewport("sm");
      const r = await render(
        <GridTableLayoutActions
          filterDefs={createSingleFilterDefs()}
          filter={{ needsRevision: true }}
          setFilter={vi.fn()}
        />,
        withRouter(),
      );
      // Then the small-screen toggle is shown and the control is not inline in the toolbar
      expect(r.gridTableLayoutActions_filterSmallButton).toBeInTheDocument();
      expect(r.query.gridTableLayoutActions_filterButton).toBeNull();
      expect(r.filter_chip_needsRevision).toBeInTheDocument();

      // When the filter icon is clicked
      click(r.gridTableLayoutActions_filterSmallButton);
      // Then the panel opens with the filter control
      expect(r.query.filter_chip_needsRevision).toBeNull();
      expect(r.filter_needsRevision).toBeInTheDocument();
    });
  });
});

describe("actionMenu", () => {
  it("renders the action menu when actionMenu is provided", async () => {
    // Given actionMenu is provided
    const r = await render(
      <GridTableLayoutActions actionMenu={{ items: [{ label: "Action", onClick: noop }] }} />,
      withRouter(),
    );
    // Then the vertical-dots menu trigger is shown
    expect(r.verticalDots).toBeInTheDocument();
  });

  it("does not render the action menu when actionMenu is not provided", async () => {
    // Given no actionMenu
    const r = await render(<GridTableLayoutActions />, withRouter());
    // Then the vertical-dots menu trigger is not shown
    expect(r.query.verticalDots).not.toBeInTheDocument();
  });
});

type SingleFilter = { needsRevision?: boolean };
type MultiFilter = { needsRevision?: boolean; status?: string[] };

function createSingleFilterDefs(): FilterDefs<SingleFilter> {
  return {
    needsRevision: checkboxFilter({ label: "Needs Revision" }),
  };
}

function createMultiFilterDefs(): FilterDefs<MultiFilter> {
  return {
    needsRevision: checkboxFilter({ label: "Needs Revision" }),
    status: multiFilter({
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      getOptionLabel: (o) => o.label,
      getOptionValue: (o) => o.value,
      label: "Status",
    }),
  };
}
