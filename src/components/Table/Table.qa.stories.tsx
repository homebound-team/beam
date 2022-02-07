import { Meta } from "@storybook/react";
import { ReactNode, useMemo } from "react";
import { Chips } from "src/components/Chips";
import { Icon } from "src/components/Icon";
import { CollapseToggle } from "src/components/Table/CollapseToggle";
import { collapseColumn, column, dateColumn, numericColumn, selectColumn } from "src/components/Table/columns";
import { emptyCell, GridColumn, GridDataRow, GridTable } from "src/components/Table/GridTable";
import { SimpleHeaderAndDataWith } from "src/components/Table/simpleHelpers";
import { beamFixedStyle, beamFlexibleStyle, beamGroupRowStyle, beamTotalsRowStyle } from "src/components/Table/styles";
import { Tag } from "src/components/Tag";
import { Css, Palette } from "src/Css";
import { Checkbox, NumberField, SelectField } from "src/inputs";
import { HasIdAndName } from "src/types";
import { noop } from "src/utils";
import { zeroTo } from "src/utils/sb";

export default {
  component: GridTable,
  title: "Design QA/Table",
  parameters: { layout: "fullscreen", backgrounds: { default: "white" } },
} as Meta;

type BeamData = {
  id: string;
  favorite: boolean;
  status: string;
  commitmentName: string;
  tradeCategories: string[];
  location: string;
  date: string;
  priceInCents: number;
};
type BeamRow = SimpleHeaderAndDataWith<BeamData>;

export function Fixed() {
  return (
    <GridTable<BeamRow>
      style={beamFixedStyle}
      sorting={{ on: "client", initial: [1, "ASC"] }}
      columns={beamStyleColumns()}
      rows={[
        { kind: "header", id: "header" },
        ...zeroTo(20).map((idx) => ({
          kind: "data" as const,
          id: `r:${idx + 1}`,
          data: {
            id: `r:${idx + 1}`,
            favorite: idx < 5,
            commitmentName: idx === 9 ? "A longer name that will truncate with an ellipsis" : `Commitment ${idx + 1}`,
            date: `01/${idx + 1 > 9 ? idx + 1 : `0${idx + 1}`}/2020`,
            status: "Success",
            tradeCategories: ["Roofing", "Architecture", "Plumbing"],
            priceInCents: 1234_56 + idx,
            location: idx % 2 ? "l:1" : "l:2",
          },
        })),
      ]}
    />
  );
}

export function Flexible() {
  return (
    <GridTable<BeamRow>
      style={beamFlexibleStyle}
      sorting={{ on: "client", initial: [1, "ASC"] }}
      columns={beamStyleColumns()}
      rows={[
        { kind: "header", id: "header" },
        ...zeroTo(20).map((idx) => ({
          kind: "data" as const,
          id: `r:${idx + 1}`,
          data: {
            id: `r:${idx + 1}`,
            favorite: idx < 5,
            commitmentName: idx === 9 ? "A longer name that will truncate with an ellipsis" : `Commitment ${idx + 1}`,
            date: `01/${idx + 1 > 9 ? idx + 1 : `0${idx + 1}`}/2020`,
            status: "Success",
            tradeCategories: ["Roofing", "Architecture", "Plumbing"],
            priceInCents: 1234_56 + idx,
            location: idx % 2 ? "l:1" : "l:2",
          },
        })),
      ]}
    />
  );
}

type BeamBudgetData = {
  name?: ReactNode;
  original?: number;
  changeOrders?: number;
  reallocations?: number;
  revised?: number;
  committed?: number;
  difference?: number;
  actuals?: number;
  projected?: number;
  costToComplete?: number;
  children?: BeamChildRow[];
};
type HeaderRow = { kind: "header" };
type BeamTotalsRow = { kind: "totals"; id: string } & BeamBudgetData;
type BeamParentRow = { kind: "parent"; id: string } & BeamBudgetData;
type BeamChildRow = { kind: "child"; id: string } & BeamBudgetData;
type BeamNestedRow = BeamTotalsRow | HeaderRow | BeamParentRow | BeamChildRow;

export function Nested() {
  const totalsRowStyles = useMemo(() => ({ totals: { cellCss: beamTotalsRowStyle } }), []);
  const rowStyles = useMemo(() => ({ parent: { cellCss: beamGroupRowStyle } }), []);
  return (
    <div css={Css.mw("fit-content").$}>
      <GridTable<BeamNestedRow>
        style={beamFixedStyle}
        columns={beamNestedColumns}
        rows={beamTotalsRows}
        rowStyles={totalsRowStyles}
      />
      <GridTable<BeamNestedRow>
        style={beamFixedStyle}
        sorting={{ on: "client" }}
        columns={beamNestedColumns}
        rows={beamNestedRows}
        rowStyles={rowStyles}
        stickyHeader
      />
    </div>
  );
}

const beamNestedRows: GridDataRow<BeamNestedRow>[] = [
  { kind: "header", id: "header" },
  ...zeroTo(5).map((pIdx) => {
    // Get a semi-random, but repeatable number of children
    const numChildren = (pIdx % 3) + pIdx + 1;
    const children = zeroTo(numChildren).map((cIdx) => ({
      kind: "child" as const,
      id: `p${pIdx + 1}_c${cIdx + 1}`,
      name: `10${pIdx + 1}0.${cIdx + 1} - Project Item`,
      original: 1234_56,
      changeOrders: 543_21,
      reallocations: 568_56,
      revised: undefined,
      committed: 129_86,
      difference: 1025_23,
      actuals: 1108_18,
      projected: 421_21,
      costToComplete: 1129_85,
    }));

    return {
      kind: "parent" as const,
      id: `p:${pIdx + 1}`,
      name: `10${pIdx + 1}0 - Cost Code`,
      original: children.map((c) => c.original ?? 0).reduce((acc, n) => acc + n, 0),
      changeOrders: children.map((c) => c.changeOrders ?? 0).reduce((acc, n) => acc + n, 0),
      reallocations: children.map((c) => c.reallocations ?? 0).reduce((acc, n) => acc + n, 0),
      revised: children.map((c) => c.revised ?? 0).reduce((acc, n) => acc + n, 0),
      committed: children.map((c) => c.committed ?? 0).reduce((acc, n) => acc + n, 0),
      difference: children.map((c) => c.difference ?? 0).reduce((acc, n) => acc + n, 0),
      actuals: children.map((c) => c.actuals ?? 0).reduce((acc, n) => acc + n, 0),
      projected: children.map((c) => c.projected ?? 0).reduce((acc, n) => acc + n, 0),
      costToComplete: children.map((c) => c.costToComplete ?? 0).reduce((acc, n) => acc + n, 0),
      children,
    };
  }),
];

const beamTotalsRows: GridDataRow<BeamNestedRow>[] = [
  {
    kind: "totals",
    id: "totals",
    name: "Totals",
    original: 1234_56,
    changeOrders: 1234_56,
    reallocations: 1234_56,
    revised: undefined,
    committed: 1234_56,
    difference: 1234_56,
    actuals: 1234_56,
    projected: 1234_56,
    costToComplete: 1234_56,
  },
];

function numberFormatter(numInCents: number | undefined) {
  return typeof numInCents !== "number"
    ? undefined
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(
        numInCents / 100,
      );
}

function maybeFormatNumber(num?: number) {
  return typeof num !== "number" || num === 0 ? null : <RollUpTotal num={num} />;
}

function RollUpTotal({ num }: { num?: number }) {
  return typeof num !== "number" || num === 0 ? null : <span css={Css.xs.$}>{numberFormatter(num)}</span>;
}

const beamNestedColumns: GridColumn<BeamNestedRow>[] = [
  collapseColumn<BeamNestedRow>({
    totals: emptyCell,
    header: (row) => <CollapseToggle row={row} />,
    parent: (row) => <CollapseToggle row={row} />,
    child: emptyCell,
  }),
  column<BeamNestedRow>({
    totals: "Totals",
    header: "Cost Code",
    parent: (row) => `${row.name ?? ""} (${row.children.length})`,
    child: (row) => row.name,
    w: "200px",
  }),
  numericColumn<BeamNestedRow>({
    totals: (row) => numberFormatter(row.original),
    header: "Original",
    parent: (row) => ({ content: () => maybeFormatNumber(row.original), value: row.original }),
    child: (row) => ({ content: () => numberFormatter(row.original) }),
  }),
  numericColumn<BeamNestedRow>({
    totals: (row) => numberFormatter(row.changeOrders),
    header: "Change Orders",
    parent: (row) => ({ content: () => maybeFormatNumber(row.changeOrders), value: row.changeOrders }),
    child: (row) => ({ content: () => numberFormatter(row.changeOrders) }),
  }),
  numericColumn<BeamNestedRow>({
    totals: (row) => numberFormatter(row.reallocations),
    header: "Reallocations",
    parent: (row) => ({ content: () => maybeFormatNumber(row.reallocations), value: row.reallocations }),
    child: (row) => ({ content: () => numberFormatter(row.reallocations) }),
  }),
  numericColumn<BeamNestedRow>({
    totals: (row) => numberFormatter(row.revised),
    header: "Revised",
    parent: (row) => ({ content: () => maybeFormatNumber(row.revised), value: row.revised }),
    child: (row) => ({ content: () => numberFormatter(row.revised) }),
  }),
  numericColumn<BeamNestedRow>({
    totals: (row) => numberFormatter(row.committed),
    header: "Committed",
    parent: (row) => ({ content: () => maybeFormatNumber(row.committed), value: row.committed }),
    child: (row) => ({ content: () => numberFormatter(row.committed) }),
  }),
  numericColumn<BeamNestedRow>({
    totals: (row) => numberFormatter(row.difference),
    header: "Difference",
    parent: (row) => ({ content: () => maybeFormatNumber(row.difference), value: row.difference }),
    child: (row) => ({ content: () => numberFormatter(row.difference) }),
  }),
  numericColumn<BeamNestedRow>({
    totals: (row) => numberFormatter(row.actuals),
    header: "Actuals",
    parent: (row) => ({ content: () => maybeFormatNumber(row.actuals), value: row.actuals }),
    child: (row) => ({ content: () => numberFormatter(row.actuals) }),
  }),
  numericColumn<BeamNestedRow>({
    totals: (row) => numberFormatter(row.projected),
    header: "Projected",
    parent: (row) => ({ content: () => maybeFormatNumber(row.projected), value: row.projected }),
    child: (row) => ({ content: () => numberFormatter(row.projected) }),
  }),
  numericColumn<BeamNestedRow>({
    totals: (row) => numberFormatter(row.costToComplete),
    header: "Cost To Complete",
    parent: (row) => ({ content: () => maybeFormatNumber(row.costToComplete), value: row.costToComplete }),
    child: (row) => ({ content: () => numberFormatter(row.costToComplete) }),
  }),
];

function beamStyleColumns() {
  const locations: HasIdAndName<string>[] = [
    { id: "l:1", name: "Living Room" },
    { id: "l:2", name: "Great Room" },
  ];

  const selectCol = selectColumn<BeamRow>({
    header: () => ({ content: <Checkbox label="Label" onChange={noop} checkboxOnly /> }),
    data: () => ({ content: <Checkbox label="Label" onChange={noop} checkboxOnly /> }),
  });
  const favCol = column<BeamRow>({
    header: () => ({ content: "" }),
    data: ({ favorite }) => ({
      content: <Icon icon="star" color={favorite ? Palette.Gray700 : Palette.Gray300} />,
      sortValue: favorite ? 0 : 1,
    }),
    // Defining `w: 56px` to accommodate for the `27px` wide checkbox and `16px` of padding on either side.
    w: "56px",
  });
  const statusCol = column<BeamRow>({
    header: "Status",
    data: ({ status }) => ({ content: <Tag text={status} type="success" />, sortValue: status }),
    w: "125px",
  });
  const nameCol = column<BeamRow>({
    header: "Commitment Name",
    data: ({ commitmentName }) => commitmentName,
    w: "220px",
  });
  const tradeCol = column<BeamRow>({
    header: "Trade Categories",
    data: ({ tradeCategories }) => ({
      content: () => <Chips values={tradeCategories.sort()} />,
      sortValue: tradeCategories.sort().join(" "),
    }),
  });
  const dateCol = dateColumn<BeamRow>({ header: "Date", data: ({ date }) => date });
  const locationCol = column<BeamRow>({
    header: "Location",
    data: (row) => ({
      content: <SelectField value={row.location} onSelect={noop} options={locations} label="Location" />,
      sortValue: row.location,
    }),
  });
  const priceCol = numericColumn<BeamRow>({
    header: "Price",
    data: ({ priceInCents }) => ({
      content: () => <NumberField label="Price" value={priceInCents} onChange={noop} type="cents" />,
      sortValue: priceInCents,
    }),
  });
  const readOnlyPriceCol = numericColumn<BeamRow>({
    header: "Read only Price",
    data: ({ priceInCents }) => ({
      content: () => <NumberField label="Price" value={priceInCents} onChange={noop} type="cents" readOnly />,
      sortValue: priceInCents,
    }),
  });

  return [selectCol, favCol, statusCol, nameCol, tradeCol, locationCol, dateCol, priceCol, readOnlyPriceCol];
}
