import { Meta } from "@storybook/react";
import { PropsWithChildren, useMemo } from "react";
import { zeroTo } from "src/utils/sb";
import { Css, Palette } from "../../../Css";
import { Button } from "../../Button";
import { IconButton } from "../../IconButton";
import { GridColumn, GridDataRow, GridTable, simpleHeader, SimpleHeaderAndData } from "../../Table";
import { FullBleed } from "../FullBleed";
import { PreventBrowserScroll } from "../PreventBrowserScroll";
import { ScrollableContent } from "../ScrollableContent";
import { ScrollableParent } from "../ScrollableParent";
import { RightPaneProvider } from "./RightPaneContext";
import { RightPaneLayout } from "./RightPaneLayout";
import { useRightPane } from "./useRightPane";

export default {
  component: RightPaneLayout,
  title: "Workspace/Components/Layout/RightPaneLayout",
} as Meta;

function SampleContent() {
  const { openRightPane } = useRightPane();
  return (
    <div css={Css.bgWhite.h100.$}>
      <Button label={"Open Pane"} onClick={() => openRightPane({ content: <DetailPane /> })} />
    </div>
  );
}

function DetailPane() {
  const { closeRightPane } = useRightPane();
  return (
    <div css={Css.bgWhite.h100.$}>
      <Button label={"Close Pane"} onClick={() => closeRightPane()} />
    </div>
  );
}

export function Basic() {
  return (
    <RightPaneProvider>
      <div css={Css.df.fdc.gap2.h100.$}>
        <RightPaneLayout paneBgColor={Palette.White}>
          <SampleContent />
        </RightPaneLayout>
      </div>
    </RightPaneProvider>
  );
}

export function GridTableWithRightPane() {
  return (
    <TestProjectLayout>
      <ExamplePageComponent />
    </TestProjectLayout>
  );
}

function ExamplePageComponent() {
  return (
    <>
      <FullBleed>
        <header css={{ ...Css.py2.bb.bGray200.$ }}>
          <h1 css={Css.xlSb.$}>Page content fixed to top</h1>
        </header>
      </FullBleed>
      <ScrollableTableExample />
    </>
  );
}

function TestProjectLayout({ children }: PropsWithChildren<{}>) {
  return (
    <PreventBrowserScroll>
      <div css={Css.df.h100.$}>
        <ScrollableParent xss={Css.px3.$}>{children}</ScrollableParent>
      </div>
    </PreventBrowserScroll>
  );
}

function ScrollableTableExample({ numCols, numRows }: { numCols?: number; numRows?: number }) {
  return (
    <ScrollableContent>
      <RightPaneProvider>
        <RightPaneLayout paneBgColor={Palette.White}>
          <TableExample numCols={numCols} numRows={numRows} />
        </RightPaneLayout>
      </RightPaneProvider>
    </ScrollableContent>
  );
}

type Row = SimpleHeaderAndData<{ name: string; value: number }>;
function TableExample({ numCols = 10, numRows = 100 }: { numCols?: number; numRows?: number }) {
  const { openRightPane } = useRightPane();

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
    [numCols],
  );

  return <GridTable as={"virtual"} stickyHeader columns={columns} rows={rows} style={{ rowHeight: "fixed" }} />;
}

function TestDetailPane({ value }: { value: number }) {
  const { closeRightPane } = useRightPane();

  return (
    <ScrollableParent>
      <div css={Css.relative.p2.bb.$}>
        <div css={Css.df.jcsb.aic.$}>
          <h2 css={Css.py2.$}>Detail Pane {value}</h2>
          <div>
            <IconButton icon={"x"} onClick={() => closeRightPane()} />
          </div>
        </div>
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
      </div>
    </ScrollableParent>
  );
}
