import { useState } from "react";
import { useLocation } from "react-router-dom";
import { checkboxFilter } from "src/components/Filters/CheckboxFilter";
import { multiFilter } from "src/components/Filters/MultiFilter";
import type { FilterDefs } from "src/components/Filters/types";
import { ModalProvider } from "src/components/Modal/ModalContext";
import { setViewport } from "src/tests/viewport";
import { noop } from "src/utils/helpers";
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

    it("does not read or write the search query param inside a modal", async () => {
      // Given a page search param and a table rendered in a modal
      const onSearch = vi.fn();
      const r = await render(
        <ModalProvider>
          <GridTableLayoutActions searchProps={{ onSearch }} />
          <SearchLocation />
        </ModalProvider>,
        withRouter("/?search=alpha"),
      );
      // Then the modal search starts empty and leaves the page param alone
      expect(r.search).toHaveValue("");
      expect(r.locationSearch).toHaveTextContent("search=alpha");
      // When the user types
      await typeAndWait(r.search, "beta");
      // Then search runs in memory and the page query param is unchanged
      expect(onSearch).toHaveBeenCalledWith("beta");
      expect(r.locationSearch).toHaveTextContent("search=alpha");
      expect(r.locationSearch.textContent).not.toContain("beta");
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
    it("nests a single filter behind the Filter button inside a modal", async () => {
      // Given a single filter rendered in a modal
      const r = await render(
        <ModalProvider>
          <GridTableLayoutActions filterDefs={createSingleFilterDefs()} filter={{}} setFilter={vi.fn()} />
        </ModalProvider>,
        withRouter(),
      );
      // Then the control is behind the Filter button instead of inline
      expect(r.gridTableLayoutActions_filterButton).toBeInTheDocument();
      expect(r.query.filter_needsRevision).toBeNull();
    });

    it("renders a single filter inline on desktop without a Filter button or panel pills", async () => {
      // Given a single filter and no groupBy on desktop
      const r = await render(
        <GridTableLayoutActions filterDefs={createSingleFilterDefs()} filter={{}} setFilter={vi.fn()} />,
        withRouter(),
      );
      // Then the filter control is inline and the toggle / pills are not shown
      expect(r.filter_needsRevision).toBeInTheDocument();
      expect(r.query.gridTableLayoutActions_filterButton).toBeNull();
      expect(r.query.filter_pill_needsRevision).toBeNull();
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
      expect(r.filter_pill_needsRevision).toBeInTheDocument();

      // When the filter button is clicked
      click(r.gridTableLayoutActions_filterButton);
      // Then the panel opens and pills are hidden
      expect(r.query.filter_pill_needsRevision).toBeNull();
      expect(r.filter_needsRevision).toBeInTheDocument();

      // When the filter button is clicked again
      click(r.gridTableLayoutActions_filterButton);
      // Then the panel closes and pills reappear
      expect(r.filter_pill_needsRevision).toBeInTheDocument();
    });

    it("counts each selected value in the Filter button badge, matching the pills", async () => {
      // Given a checkbox filter and a multi filter with two values selected
      const r = await render(
        <GridTableLayoutActions
          filterDefs={createMultiFilterDefs()}
          filter={{ needsRevision: true, status: ["active", "inactive"] }}
          setFilter={vi.fn()}
        />,
        withRouter(),
      );
      // Then the badge shows 3, one per pill
      expect(r.filter_pill_needsRevision).toBeInTheDocument();
      expect(r.filter_pill_status_active).toBeInTheDocument();
      expect(r.filter_pill_status_inactive).toBeInTheDocument();
      expect(r.countBadge).toHaveTextContent("3");
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
      expect(r.filter_pill_needsRevision).toBeInTheDocument();

      // When the filter icon is clicked
      click(r.gridTableLayoutActions_filterSmallButton);
      // Then the panel opens with the filter control
      expect(r.query.filter_pill_needsRevision).toBeNull();
      expect(r.filter_needsRevision).toBeInTheDocument();
    });
  });
});

describe("actions", () => {
  it("renders inline buttons and a menu when actions are provided", async () => {
    // Given actions with a button and a menu
    const r = await render(
      <GridTableLayoutActions
        actions={[
          { label: "Add", onClick: noop },
          {
            kind: "menu",
            trigger: { icon: "verticalDots", variant: "outline" },
            items: [{ label: "Action", onClick: noop }],
          },
        ]}
      />,
      withRouter(),
    );
    // Then the button and vertical-dots menu trigger are shown
    expect(r.add).toBeInTheDocument();
    expect(r.verticalDots).toBeInTheDocument();
    expect(r.query.verticalDots_action).toBeNull();
    // When opening the menu
    click(r.verticalDots);
    // Then the menu item is shown
    expect(r.verticalDots_action).toBeInTheDocument();
  });

  it("does not render the action menu when actions are not provided", async () => {
    // Given no actions
    const r = await render(<GridTableLayoutActions />, withRouter());
    // Then the vertical-dots menu trigger is not shown
    expect(r.query.verticalDots).not.toBeInTheDocument();
  });

  it("does not render the action menu when actions is empty", async () => {
    // Given an empty actions array
    const r = await render(<GridTableLayoutActions actions={[]} />, withRouter());
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

function SearchLocation() {
  const { search } = useLocation();
  return <div data-testid="locationSearch">{search}</div>;
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
