import { Meta } from "@storybook/react";
import { PropsWithChildren, ReactNode, useState } from "react";
import { IconButton } from "src/components/IconButton";
import { FullBleed } from "src/components/Layout/FullBleed";
import { Tab, TabsWithContent } from "src/components/Tabs";
import { Css, increment } from "src/Css";
import { FormLines } from "src/forms";
import { PreventBrowserScroll, ScrollableContent, ScrollableParent } from "src/index";
import { NumberField } from "src/inputs";
import { withBeamDecorator, withDimensions, withRouter, zeroTo } from "src/utils/sb";

export default {
  component: ScrollableParent,
  title: "Components/NestedScroll",
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

export function WithoutScrollContainer() {
  return (
    <TestLayout>
      <TestHeader title="Change Event - Mud Room" />
      <p css={Css.py1.$}>
        This is page "forgot" to use the Nested Scrolling components, though still can scroll thanks to an overflow auto
        fallback.
      </p>
      <TableExample />
    </TestLayout>
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

function ExamplePageComponent({ contentAboveTable }: { contentAboveTable?: boolean }) {
  const [selectedTab, setSelectedTab] = useState("lineItems");
  const tabs: Tab[] = [
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
        <p css={Css.mb3.$}>
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
      <ScrollableContent>
        <ul css={Css.df.fdc.childGap2.$}>
          {zeroTo(20).map((i) => (
            <li>History Item {i + 1}</li>
          ))}
        </ul>
      </ScrollableContent>
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

function TableExample({ numCols = 10, numRows = 100 }: { numCols?: number; numRows?: number }) {
  return (
    <table css={Css.w100.$}>
      <thead>
        <tr>
          {zeroTo(numCols).map((i) => (
            <th key={`th-${i}`} css={Css.sticky.px1.bgGray50.top0.tl.nowrap.$}>{`Heading ${i + 1}`}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {zeroTo(numRows).map((trIdx) => (
          <tr key={`tr-${trIdx}`}>
            {zeroTo(numCols).map((tdIdx) => (
              <td key={`td-${tdIdx}`} css={Css.px1.nowrap.$}>{`Cell ${tdIdx + 1}x${trIdx + 1}`}</td>
            ))}
          </tr>
        ))}
        <tr>
          <td colSpan={4} css={Css.px1.$}>
            Last Row!
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function TestLayout({ children }: PropsWithChildren<{}>) {
  return (
    <PreventBrowserScroll>
      <TestTopNav />
      <ScrollableParent paddingX={increment(3)}>{children}</ScrollableParent>
    </PreventBrowserScroll>
  );
}

function TestProjectLayout({ children }: PropsWithChildren<{}>) {
  return (
    <PreventBrowserScroll>
      <TestTopNav />
      {/* Required to use `overflowHidden` as the prevent the `TestLayout`'s scrollbar from kicking in. */}
      <div css={Css.df.overflowHidden.$}>
        <TestSideNav />
        <ScrollableParent xss={Css.fg1.$} paddingX={increment(3)}>
          {children}
        </ScrollableParent>
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
    <ScrollableParent
      paddingX={increment(2)}
      xss={Css.transition.br.bGray200.fg0.fs0.wPx(224).if(!showNav).mlPx(-186).$}
    >
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
