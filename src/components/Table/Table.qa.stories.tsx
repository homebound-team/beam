import { ObjectConfig, ObjectState, required, useFormStates } from "@homebound/form-state";
import { Meta } from "@storybook/react";
import { camelCase } from "change-case";
import { ReactNode, useMemo, useState } from "react";
import { Button } from "src";
import { Chips } from "src/components/Chips";
import { Icon } from "src/components/Icon";
import { GridDataRow } from "src/components/Table/components/Row";
import { GridSortConfig, GridTable, GridTableProps } from "src/components/Table/GridTable";
import { useGridTableApi } from "src/components/Table/GridTableApi";
import { TableActions } from "src/components/Table/TableActions";
import { getTableStyles } from "src/components/Table/TableStyles";
import { GridColumn } from "src/components/Table/types";
import { collapseColumn, column, dateColumn, numericColumn, selectColumn } from "src/components/Table/utils/columns";
import { simpleHeader, SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { emptyCell } from "src/components/Table/utils/utils";
import { Tag } from "src/components/Tag";
import { Css, Palette } from "src/Css";
import {
  BoundDateField,
  BoundMultiSelectField,
  BoundNumberField,
  BoundSelectField,
  BoundTextAreaField,
  BoundTextField,
} from "src/forms";
import { AuthorInput, jan1, jan10, jan2, jan29 } from "src/forms/formStateDomain";
import { useComputed } from "src/hooks";
import { NumberField, SelectField, TextField } from "src/inputs";
import { HasIdAndName } from "src/types";
import { noop } from "src/utils";
import { zeroTo } from "src/utils/sb";

interface TableStoryProps extends GridTableProps<any, any> {
  nestingDepth?: number;
  // Applies Group row styles
  grouped?: boolean;
  bordered?: boolean;
  allWhite?: boolean;
  rowHover?: boolean;
  rowHeight?: "fixed" | "flexible";
  displayAs?: "default" | "virtual" | "table";
  totals?: boolean;
  expandable?: boolean;
  vAlign?: "top" | "center" | "bottom";
}

export default {
  component: GridTable,
  parameters: {
    layout: "fullscreen",
    controls: {
      exclude: [
        "id",
        "as",
        "columns",
        "rows",
        "rowStyles",
        "rowLookup",
        "stickyHeader",
        "stickyOffset",
        "sorting",
        "fallbackMessage",
        "infoMessage",
        "filter",
        "filterMaxRows",
        "setRowCount",
        "style",
        "persistCollapse",
        "xss",
        "api",
        "resizeTarget",
        "activeRowId",
        "activeCellId",
        "visibleColumnsStorageKey",
      ],
    },
  },
  args: {
    nestingDepth: 1,
    grouped: false,
    bordered: false,
    allWhite: false,
    rowHover: true,
    rowHeight: "flexible",
    displayAs: "default",
    totals: false,
    expandable: false,
  },
  argTypes: {
    nestingDepth: { name: "Nesting Depth", options: [1, 2, 3, 4], control: { type: "select" } },
    grouped: { name: "Group styles", control: { type: "boolean" }, if: { arg: "nestingDepth", neq: 1 } },
    bordered: { name: "Bordered", control: { type: "boolean" } },
    allWhite: { name: "All White", control: { type: "boolean" } },
    vAlign: { name: "Vertical Alignment", options: ["center", "top", "bottom"], control: { type: "select" } },
    rowHover: { name: "Row Hover styles", control: { type: "boolean" } },
    totals: { name: "Show Totals row", control: { type: "boolean" } },
    expandable: { name: "With Expandable Columns", control: { type: "boolean" } },
    rowHeight: { name: "Row Height", options: ["flexible", "fixed"], control: { type: "select" } },
    displayAs: {
      name: "Implementation (may need to reload)",
      options: ["default", "virtual", "table"],
      control: { type: "select" },
    },
  },
} as Meta<TableStoryProps>;

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
type BeamRow = SimpleHeaderAndData<BeamData>;

export function Table(props: TableStoryProps) {
  const { nestingDepth, allWhite, vAlign, grouped, rowHeight, bordered, displayAs, totals, rowHover, expandable } =
    props;
  const [filter, setFilter] = useState<string>();
  const api = useGridTableApi<BeamNestedRow>();
  const selectedRows: GridDataRow<BeamNestedRow>[] = useComputed(() => api.getSelectedRows(), [api]);

  const [nestedRows, columns] = useMemo(() => {
    // Make a copy of the `rows` as we may splice in the `expandableHeader` and we don't want to mutate the original rows array.
    let rows = getRows(nestingDepth);
    if (expandable) {
      rows = [...rows, { kind: "expandableHeader", id: "expandableHeader" } as GridDataRow<BeamNestedRow>];
    }
    return [[...(totals ? beamTotalsRows : []), ...rows], beamNestedColumns(expandable)];
  }, [nestingDepth, expandable]);

  const [rows, setRows] = useState(nestedRows);

  const newRows: GridDataRow<BeamNestedRow>[] = useMemo(
    () => [
      simpleHeader,
      ...zeroTo(3).map((idx) => ({ kind: "child" as const, id: `new${idx}`, data: { name: `New ${idx + 1}` } })),
    ],
    [],
  );

  return (
    <div
      css={
        Css.df.fdc.bgGray100
          .mw("fit-content")
          .p2.if(displayAs === "virtual")
          .h("100vh").$
      }
    >
      <TableActions>
        <div css={Css.w("100vw").sm.$}>
          <div css={Css.df.aic.gap1.$}>
            <TextField
              label="Filter"
              labelStyle="hidden"
              placeholder="Search"
              value={filter}
              onChange={setFilter}
              startAdornment={<Icon icon="search" />}
              clearable
            />
            <Button
              label="Change Rows"
              onClick={() => setRows((rows) => (rows.length === 4 ? nestedRows : newRows))}
              tooltip="Simulates server side filtering"
            />
            <Button
              label="Delete Rows"
              onClick={() => {
                setRows((rows) => rows.filter((r) => !api.getSelectedRowIds().includes(r.id)));
                api.deleteRows(api.getSelectedRowIds("child"));
              }}
            />
          </div>
          <div>
            <span css={Css.smMd.mr1.$}>Selected Row Ids:</span>
            {selectedRows.length > 0 ? selectedRows.map((r) => r.id).join(", ") : "None"}
          </div>
        </div>
      </TableActions>
      <div css={Css.fg1.$}>
        <GridTable<BeamNestedRow>
          api={api}
          as={displayAs === "default" ? undefined : displayAs}
          style={{
            allWhite: allWhite || expandable,
            ...(nestingDepth && nestingDepth > 1 ? { grouped } : {}),
            rowHeight,
            bordered,
            rowHover,
            vAlign,
          }}
          sorting={{ on: "client" }}
          columns={columns}
          rows={rows}
          stickyHeader
          filter={filter}
        />
      </div>
    </div>
  );
}

export function Fixed() {
  return (
    <GridTable<BeamRow>
      style={{ rowHeight: "fixed" }}
      sorting={{ on: "client", initial: ["c1", "ASC"] }}
      columns={beamStyleColumns()}
      rows={flatRows}
    />
  );
}

export function Flexible() {
  return (
    <GridTable<BeamRow>
      style={{}}
      sorting={{ on: "client", initial: ["c1", "ASC"] }}
      columns={beamStyleColumns()}
      rows={flatRows}
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
type BeamExpandableRow = { kind: "expandableHeader"; id: string };
type BeamTotalsRow = { kind: "totals"; id: string; data: BeamBudgetData };
type BeamGreatGrandParentRow = { kind: "greatgrandparent"; id: string; data: BeamBudgetData };
type BeamGrandParentRow = { kind: "grandparent"; id: string; data: BeamBudgetData };
type BeamParentRow = { kind: "parent"; id: string; data: BeamBudgetData };
type BeamChildRow = { kind: "child"; id: string; data: BeamBudgetData };
type BeamNestedRow =
  | BeamTotalsRow
  | HeaderRow
  | BeamExpandableRow
  | BeamGreatGrandParentRow
  | BeamGrandParentRow
  | BeamParentRow
  | BeamChildRow;

export function NestedFixed() {
  return (
    <GridTable<BeamNestedRow>
      style={{ grouped: true, rowHeight: "fixed" }}
      sorting={{ on: "client" }}
      columns={nestedColumns}
      rows={[...beamTotalsRows, ...getRows(2)]}
      stickyHeader
    />
  );
}

export function NestedFlexible() {
  return (
    <GridTable<BeamNestedRow>
      style={{ grouped: true }}
      sorting={{ on: "client" }}
      columns={nestedColumns}
      rows={[...beamTotalsRows, ...getRows(2)]}
      stickyHeader
    />
  );
}

export function Filterable() {
  const api = useGridTableApi<BeamNestedRow>();
  const selectedIds = useComputed(() => api.getSelectedRows().map((r) => r.id), [api]);

  // This is useful to debug if doing `visibleRows.replace` in `RowState`
  // spams the page component to re-render in a not-infinite-but-still-unhelpful loop.
  console.log({ selectedIds });

  const [filter, setFilter] = useState<string>();
  const sorting: GridSortConfig = useMemo(() => ({ on: "client" }), []);
  return (
    <div css={Css.p1.$}>
      <div css={Css.df.gap2.aic.mb1.$}>
        <div css={Css.wPx(250).$}>
          <TextField
            label="Filter"
            labelStyle="hidden"
            placeholder="Search"
            value={filter}
            onChange={setFilter}
            startAdornment={<Icon icon="search" />}
            clearable
          />
        </div>
        <div>
          <strong>Selected Row Ids:</strong> {selectedIds.length > 0 ? selectedIds.join(", ") : "None"}
        </div>
      </div>
      <GridTable<BeamNestedRow>
        style={{ rowHeight: "fixed", grouped: true }}
        sorting={sorting}
        columns={beamNestedColumns()}
        rows={[...beamTotalsRows, ...getRows(2)]}
        stickyHeader
        filter={filter}
        api={api}
      />
    </div>
  );
}

export function NestedThreeLevels() {
  return (
    <GridTable<BeamNestedRow>
      style={{ rowHeight: "fixed", grouped: true }}
      sorting={{ on: "client" }}
      columns={nestedColumns}
      rows={getRows(3)}
      stickyHeader
    />
  );
}

export function NestedFourLevels() {
  return (
    <GridTable<BeamNestedRow>
      style={{ rowHeight: "fixed", grouped: true }}
      sorting={{ on: "client" }}
      columns={nestedColumns}
      rows={getRows(4)}
      stickyHeader
    />
  );
}

export function NestedNonGrouped() {
  return (
    <GridTable<BeamNestedRow>
      style={{ rowHeight: "fixed" }}
      sorting={{ on: "client" }}
      columns={nestedColumnsNoActions}
      rows={getRows(2)}
      stickyHeader
    />
  );
}

function getRows(nestingLevel: number = 1) {
  if (nestingLevel === 1 || nestingLevel === 2 || nestingLevel === 3 || nestingLevel === 4) {
    return beamNestedRows(nestingLevel);
  }
  throw new Error(`Invalid nesting level: ${nestingLevel}`);
}

// TODO: Make this a function smarter so it can support multiple nesting levels without so much repetition
function beamNestedRows(levels: 1 | 2 | 3 | 4 = 1): GridDataRow<BeamNestedRow>[] {
  const greatGrandParents: GridDataRow<BeamNestedRow>[] = zeroTo(2).map((ggpIdx) => {
    const grandParents = zeroTo(2).map((idx) => {
      const parents = zeroTo(2 + (idx % 2)).map((pIdx) => {
        // Get a semi-random, but repeatable number of children
        const numChildren = (pIdx % 3) + pIdx + idx + 1;
        const children = zeroTo(numChildren).map((cIdx) => {
          const valueMultiplier = cIdx + pIdx + idx + 1;
          const name = `${idx + 1}0${pIdx + 1}0.${cIdx + 1} - Project Item`;
          return {
            kind: "child" as const,
            id: `row:${camelCase(name)}:${ggpIdx}`,
            data: {
              name: `${name}${pIdx === 0 ? " with a longer name that will wrap" : ""}`,
              original: 1234_56 * valueMultiplier,
              changeOrders: 543_21 * valueMultiplier,
              reallocations: 568_56 * valueMultiplier,
              revised: undefined,
              committed: 129_86 * valueMultiplier,
              difference: 1025_23 * valueMultiplier,
              actuals: 1108_18 * valueMultiplier,
              projected: 421_21 * valueMultiplier,
              costToComplete: 1129_85 * valueMultiplier,
            },
          };
        });

        const name = `${idx + 1}0${pIdx + 1}0 - Cost Code`;
        return {
          kind: "parent" as const,
          id: camelCase(`row:${name}:${ggpIdx}`),
          children,
          data: {
            name: `${name}${pIdx === 1 ? " with a longer name that will wrap" : ""}`,
            original: children.map((c) => c.data.original ?? 0).reduce((acc, n) => acc + n, 0),
            changeOrders: children.map((c) => c.data.changeOrders ?? 0).reduce((acc, n) => acc + n, 0),
            reallocations: children.map((c) => c.data.reallocations ?? 0).reduce((acc, n) => acc + n, 0),
            revised: children.map((c) => c.data.revised ?? 0).reduce((acc, n) => acc + n, 0),
            committed: children.map((c) => c.data.committed ?? 0).reduce((acc, n) => acc + n, 0),
            difference: children.map((c) => c.data.difference ?? 0).reduce((acc, n) => acc + n, 0),
            actuals: children.map((c) => c.data.actuals ?? 0).reduce((acc, n) => acc + n, 0),
            projected: children.map((c) => c.data.projected ?? 0).reduce((acc, n) => acc + n, 0),
            costToComplete: children.map((c) => c.data.costToComplete ?? 0).reduce((acc, n) => acc + n, 0),
          },
        };
      });

      const name = `${idx + 1}000 - Division`;
      return {
        id: camelCase(`row:${name}:${ggpIdx}`),
        kind: "grandparent" as const,
        children: parents,
        data: {
          name,
          original: parents.map((p) => p.data.original ?? 0).reduce((acc, n) => acc + n, 0),
          changeOrders: parents.map((p) => p.data.changeOrders ?? 0).reduce((acc, n) => acc + n, 0),
          reallocations: parents.map((p) => p.data.reallocations ?? 0).reduce((acc, n) => acc + n, 0),
          revised: parents.map((p) => p.data.revised ?? 0).reduce((acc, n) => acc + n, 0),
          committed: parents.map((p) => p.data.committed ?? 0).reduce((acc, n) => acc + n, 0),
          difference: parents.map((p) => p.data.difference ?? 0).reduce((acc, n) => acc + n, 0),
          actuals: parents.map((p) => p.data.actuals ?? 0).reduce((acc, n) => acc + n, 0),
          projected: parents.map((p) => p.data.projected ?? 0).reduce((acc, n) => acc + n, 0),
          costToComplete: parents.map((p) => p.data.costToComplete ?? 0).reduce((acc, n) => acc + n, 0),
        },
      };
    });

    const name = `Project ${ggpIdx + 1}`;
    return {
      id: camelCase(`row:${name}`),
      kind: "greatgrandparent" as const,
      children: grandParents,
      data: {
        name,
        original: grandParents.map((gp) => gp.data.original ?? 0).reduce((acc, n) => acc + n, 0),
        changeOrders: grandParents.map((gp) => gp.data.changeOrders ?? 0).reduce((acc, n) => acc + n, 0),
        reallocations: grandParents.map((gp) => gp.data.reallocations ?? 0).reduce((acc, n) => acc + n, 0),
        revised: grandParents.map((gp) => gp.data.revised ?? 0).reduce((acc, n) => acc + n, 0),
        committed: grandParents.map((gp) => gp.data.committed ?? 0).reduce((acc, n) => acc + n, 0),
        difference: grandParents.map((gp) => gp.data.difference ?? 0).reduce((acc, n) => acc + n, 0),
        actuals: grandParents.map((gp) => gp.data.actuals ?? 0).reduce((acc, n) => acc + n, 0),
        projected: grandParents.map((gp) => gp.data.projected ?? 0).reduce((acc, n) => acc + n, 0),
        costToComplete: grandParents.map((gp) => gp.data.costToComplete ?? 0).reduce((acc, n) => acc + n, 0),
      },
    };
  });

  const grandParents = greatGrandParents[0].children!;

  return [
    simpleHeader,
    ...(levels === 4
      ? greatGrandParents
      : levels === 3
      ? grandParents
      : levels === 2
      ? grandParents.flatMap((gp) => gp.children!)
      : grandParents.flatMap((gp) => gp.children!.flatMap((p) => p.children!))),
  ];
}

const beamTotalsRows: GridDataRow<BeamNestedRow>[] = [
  {
    kind: "totals",
    id: "totals",
    data: {
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

const nestedColumns = beamNestedColumns();
const nestedColumnsNoActions = beamNestedColumns().splice(2);

function beamNestedColumns(expandable: boolean = false): GridColumn<BeamNestedRow>[] {
  return [
    collapseColumn<BeamNestedRow>({ totals: emptyCell, expandableHeader: emptyCell }),
    selectColumn<BeamNestedRow>({ totals: emptyCell, expandableHeader: emptyCell }),
    column<BeamNestedRow>({
      expandableHeader: emptyCell,
      totals: "Totals",
      header: "Cost Code",
      greatgrandparent: (data, { row }) => ({
        content: () => `${data.name} (${row.children.length})`,
      }),
      grandparent: (data, { row }) => ({
        content: () => `${data.name} (${row.children.length})`,
      }),
      parent: (data, { row }) => ({
        content: () => `${data.name} (${row.children.length})`,
      }),
      child: (row) => row.name,
      w: "200px",
    }),
    numericColumn<BeamNestedRow>({
      expandableHeader: () => "Original Budget",
      totals: (row) => numberFormatter(row.original),
      header: (_, { expanded }) => (expandable ? (expanded ? "Baseline" : emptyCell) : "Original Budget"),
      greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.original), value: row.original }),
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.original), value: row.original }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.original), value: row.original }),
      child: (row) => ({ content: () => numberFormatter(row.original), value: row.original }),
      w: "150px",
      expandColumns: [
        numericColumn<BeamNestedRow>({
          expandableHeader: emptyCell,
          totals: emptyCell,
          header: "Version 2",
          greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.original), value: row.original }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.original), value: row.original }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.original), value: row.original }),
          child: (row) => ({ content: () => numberFormatter(row.original), value: row.original }),
          w: "150px",
        }),
        numericColumn<BeamNestedRow>({
          expandableHeader: emptyCell,
          totals: emptyCell,
          header: "Version 3",
          greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.original), value: row.original }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.original), value: row.original }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.original), value: row.original }),
          child: (row) => ({ content: () => numberFormatter(row.original), value: row.original }),
          w: "150px",
        }),
      ],
    }),
    numericColumn<BeamNestedRow>({
      expandableHeader: () => "Change Orders",
      totals: (row) => numberFormatter(row.changeOrders),
      header: (_, { expanded }) => (expandable ? (expanded ? "Baseline" : emptyCell) : "Change Orders"),
      greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.changeOrders), value: row.changeOrders }),
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.changeOrders), value: row.changeOrders }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.changeOrders), value: row.changeOrders }),
      child: (row) => ({ content: () => numberFormatter(row.changeOrders), value: row.changeOrders }),
      w: "150px",
      expandColumns: [
        numericColumn<BeamNestedRow>({
          expandableHeader: emptyCell,
          totals: emptyCell,
          header: "Version 2",
          greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.changeOrders), value: row.changeOrders }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.changeOrders), value: row.changeOrders }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.changeOrders), value: row.changeOrders }),
          child: (row) => ({ content: () => numberFormatter(row.changeOrders), value: row.changeOrders }),
          w: "150px",
        }),
        numericColumn<BeamNestedRow>({
          expandableHeader: emptyCell,
          totals: emptyCell,
          header: "Version 3",
          greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.changeOrders), value: row.changeOrders }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.changeOrders), value: row.changeOrders }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.changeOrders), value: row.changeOrders }),
          child: (row) => ({ content: () => numberFormatter(row.changeOrders), value: row.changeOrders }),
          w: "150px",
        }),
      ],
    }),
    numericColumn<BeamNestedRow>({
      expandableHeader: () => "Reallocations",
      totals: (row) => numberFormatter(row.reallocations),
      header: (_, { expanded }) => (expandable ? (expanded ? "Baseline" : emptyCell) : "Reallocations"),
      greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.reallocations), value: row.reallocations }),
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.reallocations), value: row.reallocations }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.reallocations), value: row.reallocations }),
      child: (row) => ({ content: () => numberFormatter(row.reallocations), value: row.reallocations }),
      w: "150px",
      expandColumns: [
        numericColumn<BeamNestedRow>({
          expandableHeader: emptyCell,
          totals: (row) => numberFormatter(row.reallocations),
          header: "Version 2",
          greatgrandparent: (row) => ({
            content: () => maybeFormatNumber(row.reallocations),
            value: row.reallocations,
          }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.reallocations), value: row.reallocations }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.reallocations), value: row.reallocations }),
          child: (row) => ({ content: () => numberFormatter(row.reallocations), value: row.reallocations }),
          w: "150px",
        }),
        numericColumn<BeamNestedRow>({
          expandableHeader: emptyCell,
          totals: (row) => numberFormatter(row.reallocations),
          header: "Version 3",
          greatgrandparent: (row) => ({
            content: () => maybeFormatNumber(row.reallocations),
            value: row.reallocations,
          }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.reallocations), value: row.reallocations }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.reallocations), value: row.reallocations }),
          child: (row) => ({ content: () => numberFormatter(row.reallocations), value: row.reallocations }),
          w: "150px",
        }),
      ],
    }),
    numericColumn<BeamNestedRow>({
      expandableHeader: () => "Revised",
      totals: (row) => numberFormatter(row.revised),
      header: (_, { expanded }) => (expandable ? (expanded ? "Baseline" : emptyCell) : "Revised"),
      greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.revised), value: row.revised }),
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.revised), value: row.revised }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.revised), value: row.revised }),
      child: (row) => ({ content: () => numberFormatter(row.revised), value: row.revised }),
      w: "150px",
      expandColumns: [
        numericColumn<BeamNestedRow>({
          expandableHeader: emptyCell,
          totals: (row) => numberFormatter(row.revised),
          header: "Version 2",
          greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.revised), value: row.revised }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.revised), value: row.revised }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.revised), value: row.revised }),
          child: (row) => ({ content: () => numberFormatter(row.revised), value: row.revised }),
          w: "150px",
        }),
        numericColumn<BeamNestedRow>({
          expandableHeader: emptyCell,
          totals: (row) => numberFormatter(row.revised),
          header: "Version 3",
          greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.revised), value: row.revised }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.revised), value: row.revised }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.revised), value: row.revised }),
          child: (row) => ({ content: () => numberFormatter(row.revised), value: row.revised }),
          w: "150px",
        }),
      ],
    }),
    numericColumn<BeamNestedRow>({
      expandableHeader: () => "Committed",
      totals: (row) => numberFormatter(row.committed),
      header: (_, { expanded }) => (expandable ? (expanded ? "Baseline" : emptyCell) : "Committed"),
      greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.committed), value: row.committed }),
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.committed), value: row.committed }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.committed), value: row.committed }),
      child: (row) => ({ content: () => numberFormatter(row.committed), value: row.committed }),
      w: "150px",
      expandColumns: [
        numericColumn<BeamNestedRow>({
          expandableHeader: emptyCell,
          totals: (row) => numberFormatter(row.committed),
          header: "Version 2",
          greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.committed), value: row.committed }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.committed), value: row.committed }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.committed), value: row.committed }),
          child: (row) => ({ content: () => numberFormatter(row.committed), value: row.committed }),
          w: "150px",
        }),
        numericColumn<BeamNestedRow>({
          expandableHeader: emptyCell,
          totals: (row) => numberFormatter(row.committed),
          header: "Version 3",
          greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.committed), value: row.committed }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.committed), value: row.committed }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.committed), value: row.committed }),
          child: (row) => ({ content: () => numberFormatter(row.committed), value: row.committed }),
          w: "150px",
        }),
      ],
    }),
    numericColumn<BeamNestedRow>({
      expandableHeader: () => "Difference",
      totals: (row) => numberFormatter(row.difference),
      header: (_, { expanded }) => (expandable ? (expanded ? "Baseline" : emptyCell) : "Difference"),
      greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.difference), value: row.difference }),
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.difference), value: row.difference }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.difference), value: row.difference }),
      child: (row) => ({ content: () => numberFormatter(row.difference), value: row.difference }),
      w: "150px",
      expandColumns: [
        numericColumn<BeamNestedRow>({
          expandableHeader: emptyCell,
          totals: (row) => numberFormatter(row.difference),
          header: "Version 2",
          greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.difference), value: row.difference }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.difference), value: row.difference }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.difference), value: row.difference }),
          child: (row) => ({ content: () => numberFormatter(row.difference), value: row.difference }),
          w: "150px",
        }),
        numericColumn<BeamNestedRow>({
          expandableHeader: () => "Difference",
          totals: (row) => numberFormatter(row.difference),
          header: "Version 3",
          greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.difference), value: row.difference }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.difference), value: row.difference }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.difference), value: row.difference }),
          child: (row) => ({ content: () => numberFormatter(row.difference), value: row.difference }),
          w: "150px",
        }),
      ],
    }),
    numericColumn<BeamNestedRow>({
      expandableHeader: () => "Actuals",
      totals: (row) => numberFormatter(row.actuals),
      header: (_, { expanded }) => (expandable ? (expanded ? "Baseline" : emptyCell) : "Actuals"),
      greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.actuals), value: row.actuals }),
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.actuals), value: row.actuals }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.actuals), value: row.actuals }),
      child: (row) => ({ content: () => numberFormatter(row.actuals), value: row.actuals }),
      w: "150px",
      expandColumns: [
        numericColumn<BeamNestedRow>({
          expandableHeader: emptyCell,
          totals: (row) => numberFormatter(row.actuals),
          header: "Version 2",
          greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.actuals), value: row.actuals }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.actuals), value: row.actuals }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.actuals), value: row.actuals }),
          child: (row) => ({ content: () => numberFormatter(row.actuals), value: row.actuals }),
          w: "150px",
        }),
        numericColumn<BeamNestedRow>({
          expandableHeader: () => "Actuals",
          totals: (row) => numberFormatter(row.actuals),
          header: "Version 3",
          greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.actuals), value: row.actuals }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.actuals), value: row.actuals }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.actuals), value: row.actuals }),
          child: (row) => ({ content: () => numberFormatter(row.actuals), value: row.actuals }),
          w: "150px",
        }),
      ],
    }),
    numericColumn<BeamNestedRow>({
      expandableHeader: () => "Projected",
      totals: (row) => numberFormatter(row.projected),
      header: (_, { expanded }) => (expandable ? (expanded ? "Baseline" : emptyCell) : "Projected"),
      greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.projected), value: row.projected }),
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.projected), value: row.projected }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.projected), value: row.projected }),
      child: (row) => ({ content: () => numberFormatter(row.projected), value: row.projected }),
      w: "150px",
      expandColumns: [
        numericColumn<BeamNestedRow>({
          expandableHeader: emptyCell,
          totals: (row) => numberFormatter(row.projected),
          header: "Version 2",
          greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.projected), value: row.projected }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.projected), value: row.projected }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.projected), value: row.projected }),
          child: (row) => ({ content: () => numberFormatter(row.projected), value: row.projected }),
          w: "150px",
        }),
        numericColumn<BeamNestedRow>({
          expandableHeader: () => "Projected",
          totals: (row) => numberFormatter(row.projected),
          header: "Version 3",
          greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.projected), value: row.projected }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.projected), value: row.projected }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.projected), value: row.projected }),
          child: (row) => ({ content: () => numberFormatter(row.projected), value: row.projected }),
          w: "150px",
        }),
      ],
    }),
    numericColumn<BeamNestedRow>({
      expandableHeader: () => "Cost To Complete",
      totals: (row) => numberFormatter(row.costToComplete),
      header: (_, { expanded }) => (expandable ? (expanded ? "Baseline" : emptyCell) : "Cost To Complete"),
      greatgrandparent: (row) => ({ content: () => maybeFormatNumber(row.costToComplete), value: row.costToComplete }),
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.costToComplete), value: row.costToComplete }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.costToComplete), value: row.costToComplete }),
      child: (row) => ({ content: () => numberFormatter(row.costToComplete), value: row.costToComplete }),
      w: "150px",
      expandColumns: [
        numericColumn<BeamNestedRow>({
          expandableHeader: emptyCell,
          totals: (row) => numberFormatter(row.costToComplete),
          header: "Version 2",
          greatgrandparent: (row) => ({
            content: () => maybeFormatNumber(row.costToComplete),
            value: row.costToComplete,
          }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.costToComplete), value: row.costToComplete }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.costToComplete), value: row.costToComplete }),
          child: (row) => ({ content: () => numberFormatter(row.costToComplete), value: row.costToComplete }),
          w: "150px",
        }),
        numericColumn<BeamNestedRow>({
          expandableHeader: () => "Cost To Complete",
          totals: (row) => numberFormatter(row.costToComplete),
          header: "Version 3",
          greatgrandparent: (row) => ({
            content: () => maybeFormatNumber(row.costToComplete),
            value: row.costToComplete,
          }),
          grandparent: (row) => ({ content: () => maybeFormatNumber(row.costToComplete), value: row.costToComplete }),
          parent: (row) => ({ content: () => maybeFormatNumber(row.costToComplete), value: row.costToComplete }),
          child: (row) => ({ content: () => numberFormatter(row.costToComplete), value: row.costToComplete }),
          w: "150px",
        }),
      ],
    }),
  ];
}

function beamStyleColumns() {
  const locations: HasIdAndName<string>[] = [
    { id: "l:1", name: "Living Room" },
    { id: "l:2", name: "Great Room" },
  ];

  const selectCol = selectColumn<BeamRow>();
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

const flatRows: GridDataRow<BeamRow>[] = [
  simpleHeader,
  ...zeroTo(20).map((idx) => ({
    kind: "data" as const,
    id: `r:${idx + 1}`,
    data: {
      id: `r:${idx + 1}`,
      favorite: idx < 5,
      commitmentName: idx === 2 ? "A longer name that will truncate with an ellipsis" : `Commitment ${idx + 1}`,
      date: `01/${idx + 1 > 9 ? idx + 1 : `0${idx + 1}`}/2020`,
      status: "Success",
      tradeCategories: ["Roofing", "Architecture", "Plumbing"],
      priceInCents: 1234_56 + idx,
      location: idx % 2 ? "l:1" : "l:2",
    },
  })),
];

/* Input Field Story and data */
type InputFieldRows = SimpleHeaderAndData<AuthorInput>;

export function InputFieldStates() {
  const styleFixed = getTableStyles({ inlineEditing: true, rowHeight: "fixed" });
  const styleFlexible = getTableStyles({ inlineEditing: true });
  const { getFormState } = useFormStates<AuthorInput>({
    config: formConfig,
    getId: (o) => o.id!,
  });

  return (
    <>
      <h2 css={Css.mb1.$}>Fixed Table Styles</h2>
      <GridTable<InputFieldRows>
        style={styleFixed}
        columns={inputFieldColumns(getFormState)}
        rows={inputFieldRows}
        stickyHeader
      />

      <h2 css={Css.mt5.mb1.$}>Flexible Table Styles</h2>
      <GridTable<InputFieldRows>
        style={styleFlexible}
        columns={inputFieldColumns(getFormState, true)}
        rows={inputFieldRows}
        stickyHeader
      />
    </>
  );
}

function inputFieldColumns(getFormState: (author: AuthorInput) => ObjectState<AuthorInput>, flexible?: boolean) {
  function applyStateProps(id: string) {
    return {
      internalProps: { forceFocus: id === "a:3", forceHover: id === "a:2" },
      errorMsg: id === "a:4" ? "Description of error" : undefined,
      readOnly: id === "a:5",
      disabled: id === "a:6",
    };
  }

  return [
    column<InputFieldRows>({
      header: "Name",
      data: (data, { row }) => ({
        content: () => {
          const os = getFormState(data);
          return <BoundTextField field={os.firstName} {...applyStateProps(row.id)} />;
        },
      }),
    }),
    column<InputFieldRows>({
      header: "Biography",
      data: (data, { row }) => ({
        content: () => {
          const os = getFormState(data);
          return flexible ? (
            <BoundTextAreaField field={os.bio} preventNewLines {...applyStateProps(row.id)} />
          ) : (
            <BoundTextField field={os.bio} {...applyStateProps(row.id)} />
          );
        },
      }),
      w: 2,
    }),
    column<InputFieldRows>({
      header: "Birthdate",
      data: (data, { row }) => ({
        content: () => {
          const os = getFormState(data);
          return <BoundDateField field={os.birthday} {...applyStateProps(row.id)} />;
        },
      }),
      w: "136px",
    }),
    numericColumn<InputFieldRows>({
      header: "Height",
      data: (data, { row }) => ({
        content: () => {
          const os = getFormState(data);
          return <BoundNumberField field={os.heightInInches} {...applyStateProps(row.id)} />;
        },
      }),
      w: "136px",
    }),
    column<InputFieldRows>({
      header: "Favorite Sport",
      data: (data, { row }) => ({
        content: () => {
          const os = getFormState(data);
          return <BoundSelectField field={os.favoriteSport} options={sports} {...applyStateProps(row.id)} />;
        },
      }),
    }),
    column<InputFieldRows>({
      header: "Favorite Shapes",
      data: (data, { row }) => ({
        content: () => {
          const os = getFormState(data);
          return <BoundMultiSelectField field={os.favoriteShapes} options={shapes} {...applyStateProps(row.id)} />;
        },
      }),
    }),
  ];
}

const inputFieldRows: GridDataRow<InputFieldRows>[] = [
  simpleHeader,
  {
    kind: "data",
    id: "a:5",
    data: {
      id: "a:5",
      firstName: "Read Only",
      bio: "This is the read only for input fields in the table. ".repeat(2),
      birthday: jan10,
      heightInInches: 68,
      favoriteSport: "s:4",
      favoriteShapes: ["sh:5"],
    },
  },
  {
    kind: "data",
    id: "a:1",
    data: {
      id: "a:1",
      firstName: "Default State",
      bio: "This is the default state for input fields in the table. ".repeat(2),
      birthday: jan1,
      heightInInches: 72,
      favoriteSport: "s:1",
      favoriteShapes: ["sh:1", "sh:8"],
    },
  },
  {
    kind: "data",
    id: "a:2",
    data: {
      id: "a:2",
      firstName: "Hover State",
      bio: "This is the hover state for input fields in the table. ".repeat(2),
      birthday: jan10,
      heightInInches: 65,
      favoriteSport: "s:2",
      favoriteShapes: [],
    },
  },
  {
    kind: "data",
    id: "a:3",
    data: {
      id: "a:3",
      firstName: "Focus State",
      bio: "This is the focus state for input fields in the table. ".repeat(2),
      birthday: jan29,
      heightInInches: 75,
      favoriteSport: "s:3",
      favoriteShapes: ["sh:2", "sh:4"],
    },
  },
  {
    kind: "data",
    id: "a:4",
    data: {
      id: "a:4",
      firstName: "Error State",
      bio: "This is the error state for input fields in the table. ".repeat(2),
      birthday: jan2,
      heightInInches: 65,
      favoriteSport: "s:4",
      favoriteShapes: ["sh:5"],
    },
  },
  {
    kind: "data",
    id: "a:6",
    data: {
      id: "a:6",
      firstName: "Disabled State",
      bio: "This is the disabled state for input fields in the table. ".repeat(2),
      birthday: jan2,
      heightInInches: 65,
      favoriteSport: "s:4",
      favoriteShapes: ["sh:5"],
    },
  },
];

const formConfig: ObjectConfig<AuthorInput> = {
  firstName: { type: "value", rules: [required] }, // TextField
  bio: { type: "value", rules: [required] }, // TextAreaField
  birthday: { type: "value", rules: [required] }, // DateField
  heightInInches: { type: "value", rules: [required] }, // NumberField
  favoriteSport: { type: "value", rules: [required] }, // SelectField
  favoriteShapes: { type: "value", rules: [required] }, // MultiSelectField
};

const sports = [
  { id: undefined as any, name: "Undecided" },
  { id: "s:1", name: "Football" },
  { id: "s:2", name: "Soccer" },
  { id: "s:3", name: "Basketball" },
  { id: "s:4", name: "Hockey" },
];

const shapes = [
  { id: "sh:1", name: "Triangle" },
  { id: "sh:2", name: "Square" },
  { id: "sh:3", name: "Circle" },
  { id: "sh:4", name: "Trapezoid" },
  { id: "sh:5", name: "Star" },
  { id: "sh:6", name: "Hexagon" },
  { id: "sh:7", name: "Octagon" },
];
