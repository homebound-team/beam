import type { ReactNode } from "react";
import { GridTableLayoutHost } from "src/components/Layout/GridTableLayout/GridTableLayoutHost";
import type { GridTableLayoutHost as GridTableLayoutHostValue } from "src/components/Layout/GridTableLayout/useGridTableLayoutHost";
import type { ResolvedWithRightPane } from "src/components/Layout/RightPaneLayout/withRightPane";
import { useScrollViewportWidth, useVirtualizedScrollParent } from "src/components/Layout/ScrollableContent";
import { render } from "src/utils/rtl";
import { useTestIds } from "src/utils/useTestIds";

describe("GridTableLayoutHost", () => {
  it("shares the modal scroll element and viewport width with table descendants", async () => {
    // Given a modal host with its body scroller
    const scrollEl = document.createElement("main");

    // When the host renders table content
    const r = await render(
      <HostHarness host={{ kind: "modal", scrollEl, scrollViewportWidth: "100cqw" }}>
        <ScrollParentProbe expectedElement={scrollEl} />
      </HostHarness>,
    );

    // Then descendants virtualize against the modal body and size to its visible width
    expect(r.scrollParentProbe).toHaveAttribute("data-has-expected-element", "true");
    expect(r.scrollParentProbe).toHaveAttribute("data-viewport-width", "100cqw");
  });

  it("keeps document-scroll actions outside the right-pane layout", async () => {
    // Given a document-scroll host with actions and a right pane
    // When the host renders
    const r = await render(
      <HostHarness host={{ kind: "document-scroll" }} actions={<ActionsProbe />} rightPane={{ width: 280 }}>
        <TableBodyProbe />
      </HostHarness>,
    );

    // Then only the table body is scoped to the right-pane layout
    expect(r.documentScrollRightPaneLayout).toContainElement(r.tableBodyProbe);
    expect(r.documentScrollRightPaneLayout).not.toContainElement(r.actionsProbe);
  });
});

type HostHarnessProps = {
  host: GridTableLayoutHostValue;
  actions?: ReactNode;
  rightPane?: ResolvedWithRightPane;
  children: ReactNode;
};

function HostHarness({ host, actions, rightPane, children }: HostHarnessProps) {
  const tid = useTestIds({}, "gridTableLayoutHost");
  return (
    <GridTableLayoutHost host={host} actions={actions} rightPane={rightPane} isVirtualized={false} testIds={tid}>
      {children}
    </GridTableLayoutHost>
  );
}

function ScrollParentProbe({ expectedElement }: { expectedElement: HTMLElement }) {
  const scrollParent = useVirtualizedScrollParent();
  const viewportWidth = useScrollViewportWidth();
  const tid = useTestIds({}, "scrollParentProbe");
  return (
    <div data-has-expected-element={scrollParent === expectedElement} data-viewport-width={viewportWidth} {...tid} />
  );
}

function ActionsProbe() {
  const tid = useTestIds({}, "actionsProbe");
  return <div {...tid}>Actions</div>;
}

function TableBodyProbe() {
  const tid = useTestIds({}, "tableBodyProbe");
  return <div {...tid}>Table</div>;
}
