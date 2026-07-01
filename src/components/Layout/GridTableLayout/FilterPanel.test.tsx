import { useState } from "react";
import type { FilterDefs } from "src/components/Filters";
import { checkboxFilter } from "src/components/Filters";
import { click, render, withRouter } from "src/utils/rtl";
import { vi } from "vitest";
import { buildFilterImpls, FilterPanel } from "./FilterPanel";

type TestFilter = { needsRevision?: boolean };
const filterDefs: FilterDefs<TestFilter> = {
  needsRevision: checkboxFilter({ label: "Needs Revision" }),
};
const filterImpls = buildFilterImpls(filterDefs);

describe("FilterPanel", () => {
  it("renders nothing when closed with no active filters", async () => {
    const r = await render(
      <FilterPanel isOpen={false} filterImpls={filterImpls} filter={{}} setFilter={vi.fn()} onClear={vi.fn()} />,
      withRouter(),
    );
    expect(r.query.filter_clearBtn).not.toBeInTheDocument();
    expect(r.query.filter_chip_needsRevision).not.toBeInTheDocument();
  });

  it("renders chips when closed with active filters", async () => {
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
    expect(r.filter_chip_needsRevision).toBeInTheDocument();
    expect(r.filter_clearBtn).toBeInTheDocument();
  });

  it("does not render chips when open", async () => {
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
    expect(r.query.filter_chip_needsRevision).not.toBeInTheDocument();
  });

  it("shows Clear button when open and active filters exist", async () => {
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
    expect(r.filter_clearBtn).toBeInTheDocument();
  });

  it("hides Clear button when open and no active filters", async () => {
    const r = await render(
      <FilterPanel isOpen={true} filterImpls={filterImpls} filter={{}} setFilter={vi.fn()} onClear={vi.fn()} />,
      withRouter(),
    );
    expect(r.query.filter_clearBtn).not.toBeInTheDocument();
  });

  it("calls onClear when the Clear button is clicked", async () => {
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
    click(r.filter_clearBtn);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("removes the filter value when a chip is clicked", async () => {
    function Wrapper() {
      const [filter, setFilter] = useState<TestFilter>({ needsRevision: true });
      return (
        <FilterPanel
          isOpen={false}
          filterImpls={filterImpls}
          filter={filter}
          setFilter={setFilter}
          onClear={() => setFilter({})}
        />
      );
    }
    const r = await render(<Wrapper />, withRouter());

    expect(r.filter_chip_needsRevision).toBeInTheDocument();
    click(r.filter_chip_needsRevision);
    expect(r.query.filter_chip_needsRevision).not.toBeInTheDocument();
  });
});
