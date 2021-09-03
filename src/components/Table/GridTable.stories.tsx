import { Meta } from "@storybook/react";
import { observable } from "mobx";
import { Fragment, useMemo, useRef, useState } from "react";
import {
  actionColumn,
  Button,
  cardStyle,
  CollapseToggle,
  column,
  condensedStyle,
  dateColumn,
  defaultStyle,
  GridColumn,
  GridDataRow,
  GridRowLookup,
  GridRowStyles,
  GridTable,
  Icon,
  IconButton,
  numericColumn,
  SimpleHeaderAndDataOf,
} from "src/components/index";
import { Css } from "src/Css";
import { NumberField } from "src/inputs";
import { noop } from "src/utils";
import { newStory, withRouter, zeroTo } from "src/utils/sb";

export default {
  component: GridTable,
  title: "Components/GridTable",
} as Meta;

type Data = { name: string; value: number };
type Row = SimpleHeaderAndDataOf<Data>;

export function ClientSideSorting() {
  const nameColumn: GridColumn<Row> = {
    header: "Name",
    data: ({ name }) => ({ content: <div>{name}</div>, sortValue: name }),
  };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div>, clientSideSort: false };
  return (
    <GridTable
      columns={[nameColumn, valueColumn, actionColumn]}
      sorting={{ on: "client", initial: [valueColumn, "ASC"] }}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "c", value: 1 },
        { kind: "data", id: "2", name: "b", value: 2 },
        { kind: "data", id: "3", name: "a", value: 3 },
      ]}
    />
  );
}

export const Hovering = newStory(
  () => {
    const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
    const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
    const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };
    const rowStyles: GridRowStyles<Row> = {
      data: {
        cellCss: (row) => (row.value === 3 ? Css.bgRed300.$ : {}),
        rowLink: () => "http://homebound.com",
      },
      header: {},
    };
    return (
      <GridTable<Row>
        columns={[nameColumn, valueColumn, actionColumn]}
        rowStyles={rowStyles}
        rows={[
          { kind: "header", id: "header" },
          { kind: "data", id: "1", name: "c", value: 1 },
          { kind: "data", id: "2", name: "b", value: 2 },
          { kind: "data", id: "3", name: "a", value: 3 },
        ]}
      />
    );
  },
  { decorators: [withRouter()] },
);

export function VirtualFiltering() {
  const rows: GridDataRow<Row>[] = useMemo(
    () => [
      { kind: "header", id: "header" },
      ...zeroTo(1_000).map((i) => ({ kind: "data" as const, id: String(i), name: `ccc ${i}`, value: i })),
    ],
    [],
  );
  const columns: GridColumn<Row>[] = useMemo(
    () => [
      { header: "Name", data: ({ name }) => name },
      { header: "Value", data: ({ value }) => value },
      { header: "Action", data: () => <div>Actions</div>, clientSideSort: false },
    ],
    [],
  );
  const rowLookup = useRef<GridRowLookup<Row> | undefined>();
  const [filter, setFilter] = useState<string | undefined>();
  return (
    <div css={Css.df.fdc.add({ height: heightWithoutStorybookPadding }).$}>
      <div>
        <input type="text" value={filter || ""} onChange={(e) => setFilter(e.target.value)} css={Css.ba.bGray900.$} />
        <Button label="goto 500" onClick={() => rowLookup.current!.scrollTo("data", "500")} />
      </div>
      <div css={Css.fg1.$}>
        <GridTable
          as="virtual"
          columns={columns}
          sorting={{ on: "client" }}
          filter={filter}
          stickyHeader={true}
          rows={rows}
          rowLookup={rowLookup}
        />
      </div>
    </div>
  );
}

// .sb-main-padded adds 1rem on top/bottom
const heightWithoutStorybookPadding = "calc(100vh - 2rem)";

export function NoRowsFallback() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  return (
    <GridTable
      columns={[nameColumn, valueColumn]}
      rows={[{ kind: "header", id: "header" }]}
      fallbackMessage="There were no rows."
    />
  );
}

// Make a `Row` ADT for a table with a header + 3 levels of nesting
type HeaderRow = { kind: "header" };
type ParentRow = { kind: "parent"; id: string; name: string };
type ChildRow = { kind: "child"; id: string; name: string };
type GrandChildRow = { kind: "grandChild"; id: string; name: string };
type NestedRow = HeaderRow | ParentRow | ChildRow | GrandChildRow;

const rows: GridDataRow<NestedRow>[] = [
  { kind: "header", id: "header" },
  // a parent w/ two children, 1st child has 2 grandchild, 2nd child has 1 grandchild
  {
    ...{ kind: "parent", id: "p1", name: "parent 1" },
    children: [
      {
        ...{ kind: "child", id: "p1c1", name: "child p1c1" },
        children: [
          { kind: "grandChild", id: "p1c1g1", name: "grandchild p1c1g1" },
          { kind: "grandChild", id: "p1c1g2", name: "grandchild p1c1g2" },
        ],
      },
      {
        ...{ kind: "child", id: "p1c2", name: "child p1c2" },
        children: [{ kind: "grandChild", id: "p1c2g1", name: "grandchild p1c2g1" }],
      },
    ],
  },
  // a parent with just a child
  {
    ...{ kind: "parent", id: "p2", name: "parent 2" },
    children: [{ kind: "child", id: "p2c1", name: "child p2c1" }],
  },
  // a parent with no children
  { kind: "parent", id: "p3", name: "parent 3" },
];

export function NestedRows() {
  const arrowColumn = actionColumn<NestedRow>({
    header: (row) => <CollapseToggle row={row} />,
    parent: (row) => <CollapseToggle row={row} />,
    child: (row) => <CollapseToggle row={row} />,
    grandChild: () => "",
    w: 0,
  });
  const nameColumn: GridColumn<NestedRow> = {
    header: () => "Name",
    parent: (row) => ({
      content: <div>{row.name}</div>,
      value: row.name,
    }),
    child: (row) => ({
      content: <div css={Css.ml2.$}>{row.name}</div>,
      value: row.name,
    }),
    grandChild: (row) => ({
      content: <div css={Css.ml4.$}>{row.name}</div>,
      value: row.name,
    }),
  };
  return (
    <GridTable columns={[arrowColumn, nameColumn]} {...{ rows }} sorting={{ on: "client", initial: [1, "ASC"] }} />
  );
}

export function NestedCardsBeforeAfter() {
  return (
    <div>
      foo
      <div
        css={{
          ...Css.dg.gtc("100px 100px 100px").$,
          "& > div[data-level*='open1'] > div": Css.bgGray500.$,
          "& > div[data-level*='open2'] > div": Css.bgGray200.$,
          // cards for top-level
          "& > div[data-level*='open1']::before": Css.hPx(4)
            .bgGray500.add({ content: "''", gridColumn: "span 3" })
            .add({ borderTopLeftRadius: "4px", borderTopRightRadius: "4px" }).$,
          "& > div[data-level*='close1']::after": Css.hPx(4)
            .bgGray500.add({ content: "''", gridColumn: "span 3" })
            .add({ borderBottomLeftRadius: "4px", borderBottomRightRadius: "4px" }).$,
          // Draw gray between children to get a background effect
          "& > div[data-level*='middle1']::before": Css.hPx(4).bgGray500.add({ content: "''", gridColumn: "span 3" }).$,
          // cards for 2nd-level
          "& > div[data-level*='open2']::before": Css.hPx(4)
            .bgGray200.add({ content: "''", gridColumn: "span 3" })
            .add({ borderTopLeftRadius: "4px", borderTopRightRadius: "4px" }).$,
          "& > div[data-level*='close2']::after": Css.hPx(4)
            .bgGray200.add({ content: "''", gridColumn: "span 3" })
            .add({ borderBottomLeftRadius: "4px", borderBottomRightRadius: "4px" }).$,
          // spacers
          "& > div[data-spacer='level1']": Css.hPx(4).bgGray500.add({ gridColumn: "span 3" }).$,
        }}
      >
        {/* Grand-parent row */}
        <div data-level="open1" css={Css.display("contents").$}>
          <div>Milestone 1</div>
          <div>Milestone 1</div>
          <div>Milestone 1</div>
        </div>
        <div data-spacer="level1" />
        {/* Child row */}
        <div data-level="open2 close2 middle1" css={Css.display("contents").$}>
          <div>Group 1</div>
          <div>Group 1</div>
          <div>Group 1</div>
        </div>
        <div data-spacer="level1" />
        {/* Child row */}
        <div data-level="open2 close2 middle1" css={Css.display("contents").$}>
          <div>Group 2</div>
          <div>Group 2</div>
          <div>Group 2</div>
        </div>
        <div data-spacer="level1" />
        {/* Child row, could be "last grand-child" as well as "last child" */}
        <div data-level="open2 close2 middle1 close1 " css={Css.display("contents").$}>
          <div>Group 3</div>
          <div>Group 3</div>
          <div>Group 3</div>
        </div>
        <div data-spacer="level0" />
        <div data-level="open1 close1" css={Css.display("contents").$}>
          <div>Milestone 1</div>
          <div>Milestone 1</div>
          <div>Milestone 1</div>
        </div>
      </div>
    </div>
  );
}

// Every row by-definition opens or closes a card.
// Every row has a space between.

export function NestedCardsFirstCell() {
  return (
    <div>
      foo
      <div
        css={{
          ...Css.dg.gtc("100px 100px 100px").$,
          // All open/close rows are 4px
          "& > [data-card-open]": Css.hPx(4).add({ gridColumn: "span 3" }).$,
          "& > [data-card-close]": Css.hPx(4).add({ gridColumn: "span 3" }).$,
          // three levels of open
          "& > div[data-card-open]": Css.hPx(4).bgGray500.px1.$,
          "& > div[data-card-open] > div": Css.hPx(4).bgGray200.px1.$,
          "& > div[data-card-open] > div > div": Css.hPx(4).bgGreen200.px1.$,
          "& > div[data-card-close] > div > div": Css.hPx(4).bgGreen200.px1.$,
          "& > div[data-card-close] > div": Css.hPx(4).bgGray200.px1.$,
          "& > div[data-card-close]": Css.hPx(4).bgGray500.px1.$,
          // open corners
          "& > div[data-card-open='level1']": Css.brt4.$,
          "& > div[data-card-open='level2'] > div": Css.brt4.$,
          "& > div[data-card-open='level3'] > div > div": Css.brt4.$,
          "& > div[data-card-close='level3'] > div > div": Css.brb4.$,
          "& > div[data-card-close='level2'] > div": Css.brb4.$,
          "& > div[data-card-close='level1']": Css.brb4.$,
          // spaces
          "& > div[data-spacer='level0']": Css.hPx(4).add({ gridColumn: "span 3" }).$,
          "& > div[data-spacer='level1']": Css.hPx(4).bgGray500.add({ gridColumn: "span 3" }).$,
          "& > div[data-spacer='level1'] > div": Css.hPx(4).bgGray200.$,
          // backgrounds
          "& div[data-level='level1']": Css.bgGray500.$,
          "& div[data-level='level2']": Css.bgGray200.$,
          "& div[data-level='level3']": Css.bgGreen200.$,
        }}
      >
        {/* Grand-parent row */}
        <div data-card-open="level1" />
        <div css={Css.display("contents").$}>
          <div data-level="level1">Milestone 1</div>
          <div data-level="level1">Milestone 1</div>
          <div data-level="level1">Milestone 1</div>
        </div>

        <div data-spacer="level1" />

        {/* Child row */}
        <div data-card-open="level2">
          <div />
        </div>
        <div data-level="open2 close2" css={Css.display("contents").$}>
          <div>
            <div data-level="level1" css={Css.pl1.$}>
              <div data-level="level2">Group 1</div>
            </div>
          </div>
          <div data-level="level2">Group 1</div>
          <div data-level="level1" css={Css.pr1.$}>
            <div data-level="level2">Group 1</div>
          </div>
        </div>
        <div data-card-close="level2">
          <div />
        </div>

        <div data-spacer="level1" />

        {/* Child row */}
        <div data-card-open="level2">
          <div />
        </div>
        <div css={Css.display("contents").$}>
          <div>
            <div data-level="level1" css={Css.pl1.$}>
              <div data-level="level2">Group 2</div>
            </div>
          </div>
          <div data-level="level2">Group 2</div>
          <div>
            <div data-level="level1" css={Css.pr1.$}>
              <div data-level="level2">Group 2</div>
            </div>
          </div>
        </div>

        {/* 1st Grandchild row. */}
        <div data-card-open="level3">
          <div>
            <div />
          </div>
        </div>
        <div css={Css.display("contents").$}>
          <div>
            <div data-level="level1" css={Css.pl1.$}>
              <div data-level="level2" css={Css.pl1.$}>
                <div data-level="level3">Task 1</div>
              </div>
            </div>
          </div>
          <div data-level="level3">Task 1</div>
          <div>
            <div data-level="level1" css={Css.pr1.$}>
              <div data-level="level2" css={Css.pr1.$}>
                <div data-level="level3">Task 3</div>
              </div>
            </div>
          </div>
        </div>
        <div data-card-close="level3">
          <div>
            <div />
          </div>
        </div>

        <div data-spacer="level1" css={Css.px1.$}>
          <div data-spacer="level2" />
        </div>

        {/* 2nd Grandchild row. */}
        <div data-card-open="level3">
          <div>
            <div />
          </div>
        </div>
        <div css={Css.display("contents").$}>
          <div>
            <div data-level="level1" css={Css.pl1.$}>
              <div data-level="level2" css={Css.pl1.$}>
                <div data-level="level3">Task 2</div>
              </div>
            </div>
          </div>
          <div data-level="level3">Task 1</div>
          <div>
            <div data-level="level1" css={Css.pr1.$}>
              <div data-level="level2" css={Css.pr1.$}>
                <div data-level="level3">Task 2</div>
              </div>
            </div>
          </div>
        </div>
        <div data-card-close="level3">
          <div>
            <div />
          </div>
        </div>
        <div data-card-close="level2">
          <div />
        </div>

        <div data-spacer="level1" />

        {/* Child row, could be "last grand-child" as well as "last child" */}
        <div data-card-open="level2">
          <div />
        </div>
        <div css={Css.display("contents").$}>
          <div>
            <div data-level="level1" css={Css.pl1.$}>
              <div data-level="level2">Group 3</div>
            </div>
          </div>
          <div data-level="level2">Group 3</div>
          <div>
            <div data-level="level1" css={Css.pr1.$}>
              <div data-level="level2">Group 3</div>
            </div>
          </div>
        </div>
        <div data-card-close="level2">
          <div />
        </div>
        <div data-card-close="level1" />

        <div data-spacer="level0" />

        <div data-card-open="level1" />
        <div css={Css.display("contents").$}>
          <div data-level="level1">Milestone 1</div>
          <div data-level="level1">Milestone 1</div>
          <div data-level="level1">Milestone 1</div>
        </div>
        <div data-card-close="level1" />
      </div>
    </div>
  );
}

export function OneOffInlineTable() {
  const items: { code: string; name: string; quantity: number }[] = [
    { code: "AAA", name: "Aaa", quantity: 1 },
    { code: "BBB", name: "Bbb", quantity: 2 },
    { code: "Ccc", name: "Ccc", quantity: 3 },
  ];
  return (
    <div
      css={{
        ...Css.dig.gtc("auto auto auto").rg1.cg3.gray700.bgGray300.br4.p1.$,
        "& > div:nth-of-type(-n+3)": Css.tinyEm.$,
        "& > div:nth-of-type(n+4)": Css.xs.$,
        "& > div:nth-of-type(3n)": Css.tr.$,
      }}
    >
      <div>Code</div>
      <div>Item</div>
      <div>Qty</div>
      {items.map((item) => {
        return (
          <Fragment key={item.code}>
            <div>{item.code}</div>
            <div>{item.name}</div>
            <div>{item.quantity}</div>
          </Fragment>
        );
      })}
    </div>
  );
}

export function ObservableRows() {
  const o = useMemo(() => observable({ a: 1 }), []);
  const nameColumn: GridColumn<Row> = {
    header: "Name",
    data: ({ name }) => (
      <div>
        {name} {o.a}
      </div>
    ),
  };

  return (
    <div>
      <IconButton onClick={() => (o.a = o.a + 1)} icon="plus" />
      <GridTable
        columns={[nameColumn]}
        observeRows={true}
        rows={[
          { kind: "header", id: "header" },
          { kind: "data", id: "1", name: "a", value: 1 },
          { kind: "data", id: "2", name: "b", value: 2 },
        ]}
      />
    </div>
  );
}

export function StickyHeader() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = {
    header: () => (
      <div>
        Actions <br /> 2nd line
      </div>
    ),
    data: () => <div>Actions</div>,
  };
  return (
    <div style={{ height: heightWithoutStorybookPadding }}>
      some other top of page content
      <GridTable
        columns={[nameColumn, valueColumn, actionColumn]}
        stickyHeader={true}
        rows={[
          { kind: "header", id: "header" },
          ...zeroTo(200).map((i) => ({ kind: "data" as const, id: `${i}`, name: `row ${i}`, value: i })),
        ]}
      />
    </div>
  );
}

export const StyleDefault = newStory(() => {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };
  return (
    <GridTable<Row>
      columns={[nameColumn, valueColumn, actionColumn]}
      style={defaultStyle}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "c", value: 1 },
        { kind: "data", id: "2", name: "b", value: 2 },
        { kind: "data", id: "3", name: "a", value: 3 },
      ]}
    />
  );
}, {});

export const StyleCondensed = newStory(() => {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };
  return (
    <GridTable<Row>
      columns={[nameColumn, valueColumn, actionColumn]}
      style={condensedStyle}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "c", value: 1 },
        { kind: "data", id: "2", name: "b", value: 2 },
        { kind: "data", id: "3", name: "a", value: 3 },
      ]}
    />
  );
}, {});

export const StyleCondensedWithNoPadding = newStory(() => {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };
  // Use a green background to show the 1st column is flush left
  return (
    <div css={Css.bgGreen100.$}>
      <GridTable<Row>
        columns={[nameColumn, valueColumn, actionColumn]}
        style={{
          ...condensedStyle,
          headerCellCss: Css.smEm.$,
          firstCellCss: Css.pl0.$,
        }}
        rows={[
          { kind: "header", id: "header" },
          { kind: "data", id: "1", name: "c", value: 1 },
          { kind: "data", id: "2", name: "b", value: 2 },
          { kind: "data", id: "3", name: "a", value: 3 },
        ]}
      />
    </div>
  );
}, {});

export const StyleCard = newStory(() => {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name, w: 1 };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value, w: 1 };
  const actionColumn: GridColumn<Row> = { header: "", data: () => <Icon icon="star" />, w: "56px" };
  return (
    <div css={Css.wPx(550).$}>
      <GridTable<Row>
        columns={[nameColumn, valueColumn, actionColumn]}
        style={cardStyle}
        rows={[
          { kind: "header", id: "header" },
          { kind: "data", id: "1", name: "c", value: 1 },
          { kind: "data", id: "2", name: "b", value: 2 },
          { kind: "data", id: "3", name: "a", value: 3 },
        ]}
      />
    </div>
  );
}, {});

export const StyleCardWithOneColumn = newStory(() => {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  return (
    <GridTable<Row>
      columns={[nameColumn]}
      style={cardStyle}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "c", value: 1 },
        { kind: "data", id: "2", name: "b", value: 2 },
        { kind: "data", id: "3", name: "a", value: 3 },
      ]}
    />
  );
}, {});

export function AsTable() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };

  return (
    <GridTable
      as="table"
      columns={[nameColumn, valueColumn, actionColumn]}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "c", value: 1 },
        { kind: "data", id: "2", name: "b", value: 2 },
        { kind: "data", id: "3", name: "a", value: 3 },
      ]}
    />
  );
}

export function AsTableWithCustomStyles() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name, w: "75px", align: "right" };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };

  return (
    <GridTable
      as="table"
      columns={[nameColumn, valueColumn, actionColumn]}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "c", value: 1 },
        { kind: "data", id: "2", name: "b", value: 2 },
        { kind: "data", id: "3", name: "a", value: 3 },
      ]}
      rowStyles={{
        header: { cellCss: Css.p1.$ },
        data: {},
      }}
    />
  );
}

export const AsTableWithRowLink = newStory(
  () => {
    const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
    const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
    const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };
    const rowStyles: GridRowStyles<Row> = {
      data: { indent: 2, rowLink: () => "http://homebound.com" },
      header: {},
    };
    return (
      <GridTable<Row>
        as="table"
        columns={[nameColumn, valueColumn, actionColumn]}
        rowStyles={rowStyles}
        rows={[
          { kind: "header", id: "header" },
          { kind: "data", id: "1", name: "c", value: 1 },
          { kind: "data", id: "2", name: "b", value: 2 },
          { kind: "data", id: "3", name: "a", value: 3 },
        ]}
      />
    );
  },
  { decorators: [withRouter()] },
);

type Data2 = { name: string; role: string; date: string; priceInCents: number };
type Row2 = SimpleHeaderAndDataOf<Data2>;
export const DataTypeColumns = newStory(
  () => {
    const nameCol = column<Row2>({ header: "Name", data: ({ name }) => name });
    const detailCol = column<Row2>({ header: "Details", data: ({ role }) => role });
    const dateCol = dateColumn<Row2>({ header: "Date", data: ({ date }) => date });
    const priceCol = numericColumn<Row2>({
      header: "Price",
      data: ({ priceInCents }) => (
        <NumberField hideLabel label="Price" value={priceInCents} onChange={noop} type="cents" />
      ),
    });
    const readOnlyPriceCol = numericColumn<Row2>({
      header: "Read only Price",
      data: ({ priceInCents }) => (
        <NumberField hideLabel label="Price" value={priceInCents} onChange={noop} type="cents" readOnly />
      ),
    });
    const actionCol = actionColumn<Row2>({ header: "Action", data: () => <IconButton icon="check" onClick={noop} /> });
    return (
      <GridTable<Row2>
        columns={[nameCol, detailCol, dateCol, priceCol, readOnlyPriceCol, actionCol]}
        rows={[
          { kind: "header", id: "header" },
          { kind: "data", id: "1", name: "Foo", role: "Manager", date: "11/29/85", priceInCents: 113_00 },
          { kind: "data", id: "2", name: "Bar", role: "VP", date: "01/29/86", priceInCents: 1_524_99 },
          { kind: "data", id: "3", name: "Biz", role: "Engineer", date: "11/08/18", priceInCents: 80_65 },
          { kind: "data", id: "4", name: "Baz", role: "Contractor", date: "04/21/21", priceInCents: 12_365_00 },
        ]}
      />
    );
  },
  { decorators: [withRouter()] },
);

export function WrappedHeaders() {
  const leftAlignedColumn = column<Row2>({
    header: "Left aligned column header",
    data: ({ name }) => ({ content: <div>{name}</div>, sortValue: name }),
    w: "150px",
  });
  const rightAlignedColumn = numericColumn<Row2>({
    header: "Right aligned column header",
    data: ({ priceInCents }) => ({
      content: <NumberField hideLabel label="Price" value={priceInCents} onChange={noop} type="cents" readOnly />,
      sortValue: priceInCents,
    }),
    w: "150px",
  });
  const centerAlignedColumn = actionColumn<Row2>({
    header: "Center aligned column header",
    data: ({ role }) => role,
    w: "150px",
  });

  return (
    <GridTable<Row2>
      columns={[leftAlignedColumn, rightAlignedColumn, centerAlignedColumn]}
      sorting={{ on: "client", initial: [rightAlignedColumn, "ASC"] }}
      style={condensedStyle}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "Foo", role: "Manager", date: "11/29/85", priceInCents: 113_00 },
        { kind: "data", id: "2", name: "Bar", role: "VP", date: "01/29/86", priceInCents: 1_524_99 },
        { kind: "data", id: "3", name: "Biz", role: "Engineer", date: "11/08/18", priceInCents: 80_65 },
        { kind: "data", id: "4", name: "Baz", role: "Contractor", date: "04/21/21", priceInCents: 12_365_00 },
      ]}
    />
  );
}
