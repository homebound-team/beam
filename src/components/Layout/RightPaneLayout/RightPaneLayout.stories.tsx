import { Meta } from "@storybook/react-vite";
import { useEffect, useMemo, useRef } from "react";
import { ChildrenOnly } from "src/types";
import { withBeamDecorator, zeroTo } from "src/utils/sb";
import { Css } from "../../../Css";
import { Button } from "../../Button";
import { IconButton } from "../../IconButton";
import { GridColumn, GridDataRow, GridTable, SimpleHeaderAndData } from "../../Table";
import { FullBleed } from "../FullBleed";
import { PreventBrowserScroll } from "../PreventBrowserScroll";
import { ScrollableContent } from "../ScrollableContent";
import { ScrollableParent } from "../ScrollableParent";
import { RightPaneLayout } from "./RightPaneLayout";
import { useRightPane, useRightPaneActions } from "./useRightPane";

export default {
  component: RightPaneLayout,
  decorators: [withBeamDecorator],
} as Meta;

function SampleContent() {
  const { openRightPane } = useRightPaneActions();
  return (
    <div css={Css.bgWhite.h100.$}>
      <Button label={"Open Pane"} onClick={() => openRightPane({ content: <DetailPane /> })} />
    </div>
  );
}

function DetailPane() {
  const { closeRightPane } = useRightPaneActions();
  return (
    <div css={Css.bgWhite.h100.$}>
      <Button label={"Close Pane"} onClick={() => closeRightPane()} />
    </div>
  );
}

export function Basic() {
  return (
    <div css={Css.df.fdc.gap2.h100.$}>
      <RightPaneLayout>
        <SampleContent />
      </RightPaneLayout>
    </div>
  );
}

export function GridTableWithRightPane() {
  return (
    <TestProjectLayout>
      <ExamplePageComponent />
    </TestProjectLayout>
  );
}

export function RightPaneWithDefaultPaneContent() {
  return (
    <TestProjectLayout>
      <DashboardExample />
    </TestProjectLayout>
  );
}

/**
 * Toggle the pane and watch the console: `useRightPane()` re-renders even when the component
 * only uses `openRightPane`; `useRightPaneActions()` does not.
 */
export function HookRenderCountDemo() {
  return (
    <div css={Css.df.fdc.gap2.p3.$}>
      <HookRenderCountDemoControls />
      <div css={Css.df.fdc.gap1.$}>
        <HookRenderCountDemoSubscriber label="useRightPane()" hook="open" />
        <HookRenderCountDemoSubscriber label="useRightPaneActions()" hook="actions" />
      </div>
      <p css={Css.sm.$}>Open the browser console, then open/close the pane.</p>
    </div>
  );
}

function DefaultPaneContent() {
  return (
    <div css={Css.df.fdc.h100.$}>
      <div css={Css.bgWhite.w100.f1.br8.p3.$}>Right Column Content</div>
      <div css={Css.bgWhite.w100.f1.mt3.br8.p3.$}>Right Column Content</div>
    </div>
  );
}

function DashboardExample({ numCols, numRows }: { numCols?: number; numRows?: number }) {
  return (
    <ScrollableContent virtualized>
      <RightPaneLayout defaultPaneContent={<DefaultPaneContent />}>
        <TableExample numCols={numCols} numRows={numRows} />
      </RightPaneLayout>
    </ScrollableContent>
  );
}

function ExamplePageComponent() {
  return (
    <>
      <FullBleed>
        <header css={{ ...Css.py2.bb.bcGray200.$ }}>
          <h1 css={Css.xl.$}>Page content fixed to top</h1>
        </header>
      </FullBleed>
      <ScrollableTableExample />
    </>
  );
}

function TestProjectLayout({ children }: ChildrenOnly) {
  return (
    <PreventBrowserScroll>
      <div css={Css.df.h100.oh.$}>
        <ScrollableParent>{children}</ScrollableParent>
      </div>
    </PreventBrowserScroll>
  );
}

function ScrollableTableExample({ numCols, numRows }: { numCols?: number; numRows?: number }) {
  return (
    <ScrollableContent virtualized>
      <RightPaneLayout>
        <TableExample numCols={numCols} numRows={numRows} />
      </RightPaneLayout>
    </ScrollableContent>
  );
}

type Row = SimpleHeaderAndData<{ name: string; value: number }>;
function TableExample({ numCols = 10, numRows = 100 }: { numCols?: number; numRows?: number }) {
  const { openRightPane } = useRightPaneActions();

  const rows: GridDataRow<Row>[] = useMemo(
    () => [
      // simpleHeader,
      ...zeroTo(numRows).map((i) => ({
        kind: "data" as const,
        id: String(i),
        data: { name: `ccc ${i}`, value: i + 1 },
      })),
    ],
    [numRows],
  );
  const columns: GridColumn<Row>[] = useMemo(
    () =>
      zeroTo(numCols - 1).map((i) => ({
        header: `Header ${i + 1}`,
        data: ({ value }) =>
          i === 0 ? (
            <div>
              <Button
                label={"Open Pane"}
                onClick={() => openRightPane({ content: <TestDetailPane value={value} /> })}
              />
            </div>
          ) : (
            `Cell ${i + 1}x${value}`
          ),
        w: "200px",
        sticky: i === 0 ? "left" : undefined,
      })),
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [numCols],
  );

  return <GridTable as={"virtual"} stickyHeader columns={columns} rows={rows} style={{ rowHeight: "fixed" }} />;
}

function TestDetailPane({ value }: { value: number }) {
  const { closeRightPane } = useRightPaneActions();

  return (
    <div css={Css.df.fdc.h100.$}>
      <div css={Css.df.jcsb.p2.aic.bb.$}>
        <h2 css={Css.py2.$}>Detail Pane {value}</h2>
        <div>
          <IconButton icon={"x"} onClick={() => closeRightPane()} />
        </div>
      </div>
      <ScrollableParent>
        <ScrollableContent virtualized={true}>
          <nav>
            <ul css={Css.listReset.df.fdc.gap5.mt2.p2.$}>
              {zeroTo(20).map((i) => (
                <li key={i}>scroll items</li>
              ))}
              <li>Bottom!</li>
            </ul>
          </nav>
        </ScrollableContent>
      </ScrollableParent>
    </div>
  );
}

function HookRenderCountDemoControls() {
  const { openRightPane, closeRightPane, isRightPaneOpen } = useRightPane();

  return (
    <div css={Css.df.aic.gap2.$}>
      <Button label="Open pane" onClick={() => openRightPane({ content: <div css={Css.p2.$}>Demo pane body</div> })} />
      <Button label="Close pane" onClick={() => closeRightPane()} />
      <span css={Css.sm.$}>Pane open: {String(isRightPaneOpen)}</span>
    </div>
  );
}

type HookRenderCountDemoSubscriberProps = {
  label: string;
  hook: "open" | "actions";
};

function HookRenderCountDemoSubscriber({ label, hook }: HookRenderCountDemoSubscriberProps) {
  if (hook === "open") {
    return <HookRenderCountOpenHookSubscriber label={label} />;
  }
  return <HookRenderCountActionsHookSubscriber label={label} />;
}

/** Only `openRightPane` is used, but the hook still subscribes to open state. */
function HookRenderCountOpenHookSubscriber({ label }: { label: string }) {
  const { openRightPane } = useRightPane();
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`${label} render ${renderCount.current}`);
  });

  return (
    <div css={Css.p2.ba.bcGray200.br4.$}>
      <div css={Css.smSb.$}>{label}</div>
      <div css={Css.sm.$}>Uses only `openRightPane` (fn ref: {String(!!openRightPane)})</div>
      <div css={Css.sm.$}>Console render count: {renderCount.current}</div>
    </div>
  );
}

/** Same surface API for open, but no subscription to open state. */
function HookRenderCountActionsHookSubscriber({ label }: { label: string }) {
  const { openRightPane } = useRightPaneActions();
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`${label} render ${renderCount.current}`);
  });

  return (
    <div css={Css.p2.ba.bcGray200.br4.$}>
      <div css={Css.smSb.$}>{label}</div>
      <div css={Css.sm.$}>Uses only `openRightPane` (fn ref: {String(!!openRightPane)})</div>
      <div css={Css.sm.$}>Console render count: {renderCount.current}</div>
    </div>
  );
}
