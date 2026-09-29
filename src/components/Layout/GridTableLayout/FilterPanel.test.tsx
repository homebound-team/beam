import { checkboxFilter } from "src/components/Filters/CheckboxFilter";
import type { FilterDefs } from "src/components/Filters/types";
import { click, render, withRouter } from "src/utils/rtl";
import { vi } from "vitest";
import { buildFilterImpls, FilterPanel } from "./FilterPanel";

describe("FilterPanel", () => {
  it("renders nothing when closed with no active filters", async () => {
    // Given the panel is closed with no active filters
    const r = await render(
      <FilterPanel isOpen={false} filterImpls={filterImpls} filter={{}} setFilter={vi.fn()} onClear={vi.fn()} />,
      withRouter(),
    );
    // Then no pills or clear button are shown
    expect(r.query.filter_clearBtn).not.toBeInTheDocument();
    expect(r.query.filter_pill_needsRevision).not.toBeInTheDocument();
  });

  it("renders pills when closed with active filters", async () => {
    // Given the panel is closed with an active filter
    const r = await render(
      <FilterPanel
        isOpen={false}
        filterImpls={filterImpls}
        filter={{ needsRevision: true }}
        setFilter={vi.fn()}
        onClear={vi.fn()}
      />,
      withRouter(),
    );
    // Then the pill and clear button are shown
    expect(r.filter_pill_needsRevision).toBeInTheDocument();
    expect(r.filter_clearBtn).toBeInTheDocument();
  });

  it("does not render pills when open", async () => {
    // Given the panel is open with an active filter
    const r = await render(
      <FilterPanel
        isOpen={true}
        filterImpls={filterImpls}
        filter={{ needsRevision: true }}
        setFilter={vi.fn()}
        onClear={vi.fn()}
      />,
      withRouter(),
    );
    // Then no pills are shown (pills are only shown in the collapsed state)
    expect(r.query.filter_pill_needsRevision).not.toBeInTheDocument();
  });

  it("shows Clear button when open and active filters exist", async () => {
    // Given the panel is open with an active filter
    const r = await render(
      <FilterPanel
        isOpen={true}
        filterImpls={filterImpls}
        filter={{ needsRevision: true }}
        setFilter={vi.fn()}
        onClear={vi.fn()}
      />,
      withRouter(),
    );
    // Then the clear button is shown
    expect(r.filter_clearBtn).toBeInTheDocument();
  });

  it("hides Clear button when open and no active filters", async () => {
    // Given the panel is open with no active filters
    const r = await render(
      <FilterPanel isOpen={true} filterImpls={filterImpls} filter={{}} setFilter={vi.fn()} onClear={vi.fn()} />,
      withRouter(),
    );
    // Then the clear button is hidden
    expect(r.query.filter_clearBtn).not.toBeInTheDocument();
  });

  it("calls onClear when the Clear button is clicked", async () => {
    // Given the panel is closed with an active filter
    const onClear = vi.fn();
    const r = await render(
      <FilterPanel
        isOpen={false}
        filterImpls={filterImpls}
        filter={{ needsRevision: true }}
        setFilter={vi.fn()}
        onClear={onClear}
      />,
      withRouter(),
    );
    // When the Clear button is clicked
    click(r.filter_clearBtn);
    // Then onClear is called once
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

type TestFilter = { needsRevision?: boolean };
const filterDefs: FilterDefs<TestFilter> = {
  needsRevision: checkboxFilter({ label: "Needs Revision" }),
};
const filterImpls = buildFilterImpls(filterDefs);
