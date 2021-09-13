import { Meta } from "@storybook/react";
import { PropsWithChildren, ReactNode, useState } from "react";
import { IconButton } from "src/components/IconButton";
import { NestedScrollProvider } from "src/components/Layout/NestedScrollLayoutContext";
import { PreventBrowserScroll } from "src/components/Layout/PreventBrowserScroll";
import { ScrollableContent } from "src/components/Layout/ScrollableContent";
import { Tab, Tabs } from "src/components/Tabs";
import { Css } from "src/Css";
import { FormLines } from "src/forms";
import { NumberField } from "src/inputs";
import { noop } from "src/utils";
import { withBeamDecorator, withDimensions, zeroTo } from "src/utils/sb";

export default {
  component: NestedScrollProvider,
  title: "Components/NestedScroll",
  decorators: [withBeamDecorator, withDimensions()],
  parameters: { layout: "fullscreen" },
} as Meta;

export function BasicLayout() {
  return (
    <TestLayout>
      <ExamplePageComponent />
    </TestLayout>
  );
}

export function ContentAboveTable() {
  return (
    <TestLayout>
      <ExamplePageComponent contentAboveTable />
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
      <div css={consistentPadding}>
        <p css={Css.py1.$}>
          This is page "forgot" to use the Nested Scrolling components, though still can scroll thanks to an overflow
          auto fallback.
        </p>
        <TableExample />
      </div>
    </TestLayout>
  );
}

export function EditableTableSize() {
  const [rows, setRows] = useState<number>(100);
  const [cols, setCols] = useState<number>(30);

  return (
    <TestProjectLayout>
      <TestHeader title="Change Event - Mud Room" />
      <div css={{ ...consistentPadding, ...Css.py1.$ }}>
        <FormLines width="sm">
          <NumberField label="Number of rows" value={rows} onChange={(n) => n && setRows(n)} compact />
          <NumberField label="Number of columns" value={cols} onChange={(n) => n && setCols(n)} compact />
        </FormLines>
      </div>
      <ScrollableContent>
        <div css={consistentPadding}>
          <TableExample numCols={cols} numRows={rows} />
        </div>
      </ScrollableContent>
    </TestProjectLayout>
  );
}

function ExamplePageComponent({ contentAboveTable }: { contentAboveTable?: boolean }) {
  const tabs: Tab[] = [
    { value: "overview", name: "Overview", render: () => <></> },
    { value: "lineItems", name: "Line Items", render: () => <></> },
    { value: "history", name: "History", render: () => <></> },
  ];
  return (
    <>
      {/* Probably will move away from `usePageHeader` and instead go to this. */}
      <TestHeader title="Change Event - Mud Room" />

      <div css={{ ...consistentPadding, ...Css.py1.$ }}>
        <Tabs selected="overview" tabs={tabs} onChange={noop} />
      </div>

      <ScrollableContent>
        <div css={consistentPadding}>
          {contentAboveTable && (
            <p css={Css.py2.$}>
              This is some content above the table that will not be fixed in place.
              <br />
              As the user scrolls, this content should be scrolled out of view.
            </p>
          )}
          <TableExample />
        </div>
      </ScrollableContent>
    </>
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
      <NestedScrollProvider>{children}</NestedScrollProvider>
    </PreventBrowserScroll>
  );
}

function TestProjectLayout({ children }: PropsWithChildren<{}>) {
  return (
    <TestLayout>
      {/* Required to use `overflowHidden` as the prevent the `TestLayout`'s scrollbar from kicking in. */}
      <div css={Css.df.overflowHidden.$}>
        <TestSideNav />
        <NestedScrollProvider xss={Css.fg1.$}>{children}</NestedScrollProvider>
      </div>
    </TestLayout>
  );
}

function TestTopNav() {
  return <nav css={Css.hPx(56).w100.bgGray800.white.df.aic.px3.fs0.mh0.sticky.top0.z1.$}>Top Level Navigation</nav>;
}

function TestSideNav() {
  const [showNav, setShowNav] = useState(true);
  return (
    <NestedScrollProvider xss={Css.transition.br.bGray200.fg0.fs0.ml0.wPx(224).if(!showNav).mlPx(-186).$}>
      <div css={Css.relative.$}>
        <div css={Css.absolute.top1.rightPx(4).bgGray50.df.aic.jcc.$}>
          <IconButton icon={showNav ? "menuClose" : "menuOpen"} onClick={() => setShowNav(!showNav)} />
        </div>
        {showNav && (
          <>
            <h2 css={Css.bb.bGray200.px2.py3.$}>Scrollable Side Navigation</h2>
            <ScrollableContent>
              <nav>
                <ul css={Css.listReset.df.fdc.childGap5.mt2.px2.$}>
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
    </NestedScrollProvider>
  );
}

const consistentPadding = Css.px3.$;

function TestHeader({ title }: { title: ReactNode }) {
  return (
    <header css={{ ...Css.py2.bb.bGray200.$, ...consistentPadding }}>
      <h1 css={Css.xlEm.$}>{title}</h1>
    </header>
  );
}
