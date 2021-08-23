import { Meta } from "@storybook/react";
import { useState } from "react";
import { NestedScrollProvider } from "src/components/Layout/NestedScrollLayoutContext";
import { ScrollableContent } from "src/components/Layout/ScrollableContent";
import { TestHeader, TestLayout, TestPageSpacing, TestProjectLayout } from "src/components/Layout/TestLayout";
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
      <TestPageSpacing>
        <p css={Css.py1.$}>
          This is page "forgot" to use the Nested Scrolling components, though still can scroll thanks to an overflow
          auto fallback.
        </p>
        <TableExample />
      </TestPageSpacing>
    </TestLayout>
  );
}

export function EditableTableSize() {
  return (
    <TestProjectLayout>
      <TestHeader title="Change Event - Mud Room" />
      <ScrollableContent>
        <TestPageSpacing>
          <TableExample numCols={30} numRows={30} editable />
        </TestPageSpacing>
      </ScrollableContent>
    </TestProjectLayout>
  );
}

// Story without `PreventScrollContainer`

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

      <TestPageSpacing xss={Css.py1.$}>
        <Tabs selected="overview" tabs={tabs} onChange={noop} />
      </TestPageSpacing>

      <ScrollableContent>
        <TestPageSpacing>
          {contentAboveTable && (
            <p css={Css.py2.$}>
              This is some content above the table that will not be fixed in place.
              <br />
              As the user scrolls, this content should be scrolled out of view.
            </p>
          )}
          <TableExample />
        </TestPageSpacing>
      </ScrollableContent>
    </>
  );
}

function TableExample({
  numCols = 10,
  numRows = 100,
  editable = false,
}: {
  numCols?: number;
  numRows?: number;
  editable?: boolean;
}) {
  const [rows, setRows] = useState<number>(numRows);
  const [cols, setCols] = useState<number>(numCols);

  return (
    <>
      {editable && (
        <FormLines width="sm">
          <NumberField label="Number of rows" value={rows} onChange={(n) => n && setRows(n)} compact />
          <NumberField label="Number of columns" value={cols} onChange={(n) => n && setCols(n)} compact />
        </FormLines>
      )}
      <table css={Css.w100.$}>
        <thead>
          <tr>
            {zeroTo(numCols).map((i) => (
              <th key={`th-${i}`} css={Css.sticky.px1.bgGray50.top0.tl.nowrap.$}>{`Heading ${i + 1}`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {zeroTo(rows).map((trIdx) => (
            <tr key={`tr-${trIdx}`}>
              {zeroTo(cols).map((tdIdx) => (
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
    </>
  );
}
