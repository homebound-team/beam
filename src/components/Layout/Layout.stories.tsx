import { Meta } from "@storybook/react";
import { PropsWithChildren, ReactNode, useMemo, useState } from "react";
import { IconButton } from "src/components/IconButton";
import { TabsWithContent, TabWithContent } from "src/components/Tabs";
import { Css } from "src/Css";
import { FormLines } from "src/forms";
import {
  FullBleed,
  GridColumn,
  GridDataRow,
  GridTable,
  PreventBrowserScroll,
  ScrollableContent,
  ScrollableParent,
  simpleHeader,
  SimpleHeaderAndData,
} from "src/index";
import { NumberField } from "src/inputs/NumberField";
import { withBeamDecorator, withDimensions, withRouter, zeroTo } from "src/utils/sb";

export default {
  component: ScrollableParent,
  title: "Components/Layout",
  decorators: [withBeamDecorator, withDimensions(), withRouter()],
  parameters: { layout: "fullscreen" },
} as Meta;

export function BasicLayout() {
  return (
    <TestLayout>
      <ExamplePageComponent />
    </TestLayout>
  );
}

export function SideNavLayout() {
  return (
    <TestProjectLayout>
      <ExamplePageComponent />
    </TestProjectLayout>
  );
}

export function EditableTableSize() {
  const [rows, setRows] = useState<number>(100);
  const [cols, setCols] = useState<number>(30);

  return (
    <TestProjectLayout>
      <TestHeader title="Change Event - Mud Room" />
      <div css={Css.py1.$}>
        <FormLines width="sm">
          <NumberField label="Number of rows" value={rows} onChange={(n) => n && setRows(n)} compact />
          <NumberField label="Number of columns" value={cols} onChange={(n) => n && setCols(n)} compact />
        </FormLines>
      </div>
      <ScrollableContent>
        <ScrollableTableExample numCols={cols} numRows={rows} />
      </ScrollableContent>
    </TestProjectLayout>
  );
}

export function VirtualizedScrolling() {
  return (
    <TestProjectLayout>
      <VirutalizedPage />
    </TestProjectLayout>
  );
}

export function WithoutScrollableParent() {
  return (
    <PreventBrowserScroll>
      <TestTopNav />
      <TestHeader title="Change Event - Mud Room" />
      <p css={Css.py1.$}>
        This is page "forgot" to use the "ScrollableParent" component, though still can scroll thanks to an overflow
        auto fallback.
      </p>
      <TableExample />
    </PreventBrowserScroll>
  );
}

export function WithoutScrollableContent() {
  return (
    <TestLayout>
      <TestHeader title="Change Event - Mud Room" />
      <p css={Css.py1.$}>
        This is page "forgot" to use the "ScrollableContent" component, though still can scroll thanks to an overflow
        auto fallback.
      </p>
      <TableExample />
    </TestLayout>
  );
}

export function ScrollableParentFallback() {
  return (
    <TestProjectLayout>
      <TestHeader title="Change Event - Mud Room" />
      <p css={Css.py1.$}>
        This is page "forgot" to use the "ScrollableContent" component and lives within a layout that disables the
        scrolling fallback from "PreventBrowserScroll". Instead, it utilizes the fallback from within the
        ScrollableParent component.
      </p>
      <TableExample />
    </TestProjectLayout>
  );
}

function ExamplePageComponent() {
  const [selectedTab, setSelectedTab] = useState("lineItems");
  const tabs: TabWithContent[] = [
    { value: "overview", name: "Overview", render: () => <OverviewExample /> },
    { value: "lineItems", name: "Line Items", render: () => <ScrollableTableExample /> },
    { value: "history", name: "History", render: () => <HistoryExample /> },
  ];
  return (
    <>
      {/* Probably will move away from `usePageHeader` and instead go to this. */}
      <TestHeader title="Change Event - Mud Room" />

      <div css={Css.py1.$}>
        <TabsWithContent selected={selectedTab} tabs={tabs} onChange={(t) => setSelectedTab(t)} />
      </div>
    </>
  );
}

function OverviewExample() {
  return (
    <ScrollableContent>
      <h1 css={Css.lgEm.mb3.$}>Detail</h1>
      {zeroTo(10).map((i) => (
        <p key={i} css={Css.mb3.$}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </p>
      ))}
    </ScrollableContent>
  );
}

function HistoryExample() {
  return (
    <>
      <div css={Css.lgEm.$}>History</div>
      <p>Demonstrates not utilizing ScrollableContent component. Expect this section of the layout to scroll</p>
      <ul css={Css.df.fdc.childGap2.$}>
        {zeroTo(20).map((i) => (
          <li key={i}>History Item {i + 1}</li>
        ))}
      </ul>
    </>
  );
}

function ScrollableTableExample({ numCols, numRows }: { numCols?: number; numRows?: number }) {
  return (
    <ScrollableContent>
      <TableExample numCols={numCols} numRows={numRows} />
    </ScrollableContent>
  );
}

type Row = SimpleHeaderAndData<{ name: string; value: number }>;
function TableExample({
  numCols = 10,
  numRows = 100,
  virtualized = false,
}: {
  numCols?: number;
  numRows?: number;
  virtualized?: boolean;
}) {
  const rows: GridDataRow<Row>[] = useMemo(
    () => [
      simpleHeader,
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
      zeroTo(numCols).map((i) => ({
        header: `Header ${i + 1}`,
        data: ({ value }) => `Cell ${i + 1}x${value}`,
        w: "100px",
        sticky: i === 0 ? "left" : undefined,
      })),
    [numCols],
  );

  return (
    <GridTable
      as={virtualized ? "virtual" : "div"}
      stickyHeader
      columns={columns}
      rows={rows}
      style={{ rowHeight: "fixed" }}
    />
  );
}

function VirutalizedPage() {
  return (
    <>
      <TestHeader title="Change Event - Mud Room" />
      <p css={Css.py2.$}>Content above the table</p>
      {/*
        Providing a <ScrollableContent> wrapper here isn't really necessary,
        as the Virtualized component will provide its own scrolling behavior.
        Though, because we want to wrap the VirtualizedTable in an element to provide some consistent padding,
        that means we need to set h100 on the wrapping element. Since setting h100 means it'll take the full height of the parent,
        then it's better to wrap in ScrollableContent because ScrollableContent's height is based on the remaining space available in the viewport. But...

        Side note: Even removing <ScrollableContent /> here and keeping the wrapping div with `h100` seems to work.
        I am kind of perplexed on why `h100` isn't taking up 100% of the parent container, but somehow taking up just the remaining space.
        For example, my parent container is 868px. Within this container I have the <TestHeader /> and <p>, then the `h100` div below.
        That `h100` was translating to '735px', though if I set the `height: 10%`, then it translates to 86.8px. (if 10% is 86.8 how is 100% 735???)
        Because I am unsure why/how ends up taking up the correct amount of space, I would push to continue to wrap inside of <ScrollableContent />
        ¯\_(ツ)_/¯
      */}
      <ScrollableContent virtualized>
        <TableExample virtualized numCols={30} />
      </ScrollableContent>
    </>
  );
}

function TestLayout({ children }: PropsWithChildren<{}>) {
  return (
    <PreventBrowserScroll>
      <TestTopNav />
      <ScrollableParent xss={Css.px(3).$}>{children}</ScrollableParent>
    </PreventBrowserScroll>
  );
}

function TestProjectLayout({ children }: PropsWithChildren<{}>) {
  return (
    <PreventBrowserScroll>
      <TestTopNav />
      {/* Required to use `overflowHidden` to prevent the `PreventBrowserScroll`'s scrollbar from kicking in,
          which would scroll both the side nav and the main content at the same time. */}
      <div css={Css.df.overflowHidden.h100.$}>
        <TestSideNav />
        <ScrollableParent xss={Css.px3.$}>{children}</ScrollableParent>
      </div>
    </PreventBrowserScroll>
  );
}

function TestTopNav() {
  return <nav css={Css.hPx(56).w100.bgGray800.white.df.aic.px3.fs0.mh0.sticky.top0.z1.$}>Top Level Navigation</nav>;
}

function TestSideNav() {
  const [showNav, setShowNav] = useState(true);
  return (
    <ScrollableParent xss={Css.transition.br.bGray200.fg0.fs0.wPx(224).px2.if(!showNav).mlPx(-186).$}>
      <div css={Css.relative.$}>
        <div css={Css.absolute.top1.rightPx(-12).bgGray50.df.aic.jcc.$}>
          <IconButton icon={showNav ? "menuClose" : "menuOpen"} onClick={() => setShowNav(!showNav)} />
        </div>
        {showNav && (
          <>
            <FullBleed>
              <h2 css={Css.bb.bGray200.py3.$}>Scrollable Side Navigation</h2>
            </FullBleed>
            <ScrollableContent>
              <nav>
                <ul css={Css.listReset.df.fdc.childGap5.mt2.$}>
                  {zeroTo(20).map((i) => (
                    <li key={i}>Side Navigation Item</li>
                  ))}
                  <li>Bottom!</li>
                </ul>
              </nav>
            </ScrollableContent>
          </>
        )}
      </div>
    </ScrollableParent>
  );
}

function TestHeader({ title }: { title: ReactNode }) {
  return (
    <FullBleed>
      <header css={{ ...Css.py2.bb.bGray200.$ }}>
        <h1 css={Css.xlEm.$}>{title}</h1>
      </header>
    </FullBleed>
  );
}
