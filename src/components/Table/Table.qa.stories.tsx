import { ObjectConfig, ObjectState, required, useFormStates } from "@homebound/form-state";
import { Meta } from "@storybook/react";
import { default as React, ReactNode, useMemo, useState } from "react";
import { Chips } from "src/components/Chips";
import { Icon } from "src/components/Icon";
import { collapseColumn, column, dateColumn, numericColumn, selectColumn } from "src/components/Table/columns";
import { emptyCell, GridColumn, GridDataRow, GridSortConfig, GridTable } from "src/components/Table/GridTable";
import { useGridTableApi } from "src/components/Table/GridTableApi";
import { simpleHeader, SimpleHeaderAndData } from "src/components/Table/simpleHelpers";
import { getTableStyles } from "src/components/Table/styles";
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
type BeamRow = SimpleHeaderAndData<BeamData>;

export function Fixed() {
  return (
    <GridTable<BeamRow>
      style={{}}
      sorting={{ on: "client", initial: [1, "ASC"] }}
      columns={beamStyleColumns()}
      rows={flatRows}
    />
  );
}

export function Flexible() {
  return (
    <GridTable<BeamRow>
      style={{ flexible: true }}
      sorting={{ on: "client", initial: [1, "ASC"] }}
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
type BeamTotalsRow = { kind: "totals"; id: string; data: BeamBudgetData };
type BeamGrandParentRow = { kind: "grandparent"; id: string; data: BeamBudgetData };
type BeamParentRow = { kind: "parent"; id: string; data: BeamBudgetData };
type BeamChildRow = { kind: "child"; id: string; data: BeamBudgetData };
type BeamNestedRow = BeamTotalsRow | HeaderRow | BeamGrandParentRow | BeamParentRow | BeamChildRow;

export function NestedFixed() {
  return (
    <div css={Css.mw("fit-content").$}>
      <GridTable<BeamNestedRow>
        style={{ grouped: true, totals: true }}
        columns={nestedColumnsTwoLevels}
        rows={beamTotalsRows}
      />
      <GridTable<BeamNestedRow>
        style={{ grouped: true }}
        sorting={{ on: "client" }}
        columns={nestedColumnsTwoLevels}
        rows={nestedRowsTwoLevels}
        stickyHeader
      />
    </div>
  );
}

export function NestedFlexible() {
  return (
    <div css={Css.mw("fit-content").$}>
      <GridTable<BeamNestedRow>
        style={{ flexible: true, grouped: true, totals: true }}
        columns={nestedColumnsTwoLevels}
        rows={beamTotalsRows}
      />
      <GridTable<BeamNestedRow>
        style={{ flexible: true, grouped: true }}
        sorting={{ on: "client" }}
        columns={nestedColumnsTwoLevels}
        rows={nestedRowsTwoLevels}
        stickyHeader
      />
    </div>
  );
}

export function Filterable() {
  const api = useGridTableApi<BeamNestedRow>();
  const selectedIds = useComputed(() => api.getSelectedRows().map((r) => r.id), [api]);

  // This is useful to debug if doing `visibleRows.replace` in `RowState`
  // spams the page component to re-render in a not-infinite-but-still-unhelpful loop.
  console.log({ selectedIds });

  const [filter, setFilter] = useState<string>();
  const sorting: GridSortConfig<{}> = useMemo(() => ({ on: "client" }), []);
  return (
    <div css={Css.p1.$}>
      <div css={Css.df.gap2.aic.mb1.$}>
        <div css={Css.wPx(250).$}>
          <TextField
            label="Filter"
            hideLabel
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
        style={{ grouped: true }}
        sorting={sorting}
        columns={beamNestedColumns()}
        rows={nestedRowsTwoLevels}
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
      style={{ grouped: true }}
      sorting={{ on: "client" }}
      columns={nestedColumnsThreeLevels}
      rows={nestedRowsThreeLevels}
      stickyHeader
    />
  );
}

export function NestedNonGrouped() {
  return (
    <GridTable<BeamNestedRow>
      style={{}}
      sorting={{ on: "client" }}
      columns={nestedColumnsTwoLevelsNoActions}
      rows={nestedRowsTwoLevels}
      stickyHeader
    />
  );
}

const nestedRowsTwoLevels = beamNestedRows();
const nestedRowsThreeLevels = beamNestedRows(true);

function beamNestedRows(threeLevels: boolean = false): GridDataRow<BeamNestedRow>[] {
  const grandParents: GridDataRow<BeamNestedRow>[] = zeroTo(2).map((idx) => {
    const parents = zeroTo(2 + (idx % 2)).map((pIdx) => {
      // Get a semi-random, but repeatable number of children
      const numChildren = (pIdx % 3) + pIdx + idx + 1;
      const children = zeroTo(numChildren).map((cIdx) => ({
        kind: "child" as const,
        id: `gp:${idx + 1}_p${pIdx + 1}_c${cIdx + 1}`,
        data: {
          name: `${idx + 1}0${pIdx + 1}0.${cIdx + 1} - Project Item${
            pIdx === 0 ? " with a longer name that will wrap" : ""
          }`,
          original: 1234_56,
          changeOrders: 543_21,
          reallocations: 568_56,
          revised: undefined,
          committed: 129_86,
          difference: 1025_23,
          actuals: 1108_18,
          projected: 421_21,
          costToComplete: 1129_85,
        },
      }));

      return {
        kind: "parent" as const,
        id: `gp:${idx + 1}_p:${pIdx + 1}`,
        children,
        data: {
          name: `${idx + 1}0${pIdx + 1}0 - Cost Code${pIdx === 1 ? " with a longer name that will wrap" : ""}`,
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

    return {
      id: `gp:${idx + 1}`,
      kind: "grandparent" as const,
      children: parents,
      data: {
        name: `${idx + 1}000 - Division`,
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

  return [simpleHeader, ...(threeLevels ? grandParents : grandParents.flatMap((gp) => gp.children!))];
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

const nestedColumnsTwoLevels = beamNestedColumns();
const nestedColumnsTwoLevelsNoActions = beamNestedColumns().splice(2);
const nestedColumnsThreeLevels = beamNestedColumns(true);

function beamNestedColumns(threeLevels: boolean = false): GridColumn<BeamNestedRow>[] {
  return [
    collapseColumn<BeamNestedRow>({ totals: emptyCell }),
    selectColumn<BeamNestedRow>({ totals: emptyCell }),
    column<BeamNestedRow>({
      totals: "Totals",
      header: "Cost Code",
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
      totals: (row) => numberFormatter(row.original),
      header: "Original",
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.original), value: row.original }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.original), value: row.original }),
      child: (row) => ({ content: () => numberFormatter(row.original) }),
    }),
    numericColumn<BeamNestedRow>({
      totals: (row) => numberFormatter(row.changeOrders),
      header: "Change Orders",
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.changeOrders), value: row.changeOrders }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.changeOrders), value: row.changeOrders }),
      child: (row) => ({ content: () => numberFormatter(row.changeOrders) }),
    }),
    numericColumn<BeamNestedRow>({
      totals: (row) => numberFormatter(row.reallocations),
      header: "Reallocations",
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.reallocations), value: row.reallocations }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.reallocations), value: row.reallocations }),
      child: (row) => ({ content: () => numberFormatter(row.reallocations) }),
    }),
    numericColumn<BeamNestedRow>({
      totals: (row) => numberFormatter(row.revised),
      header: "Revised",
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.revised), value: row.revised }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.revised), value: row.revised }),
      child: (row) => ({ content: () => numberFormatter(row.revised) }),
    }),
    numericColumn<BeamNestedRow>({
      totals: (row) => numberFormatter(row.committed),
      header: "Committed",
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.committed), value: row.committed }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.committed), value: row.committed }),
      child: (row) => ({ content: () => numberFormatter(row.committed) }),
    }),
    numericColumn<BeamNestedRow>({
      totals: (row) => numberFormatter(row.difference),
      header: "Difference",
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.difference), value: row.difference }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.difference), value: row.difference }),
      child: (row) => ({ content: () => numberFormatter(row.difference) }),
    }),
    numericColumn<BeamNestedRow>({
      totals: (row) => numberFormatter(row.actuals),
      header: "Actuals",
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.actuals), value: row.actuals }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.actuals), value: row.actuals }),
      child: (row) => ({ content: () => numberFormatter(row.actuals) }),
    }),
    numericColumn<BeamNestedRow>({
      totals: (row) => numberFormatter(row.projected),
      header: "Projected",
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.projected), value: row.projected }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.projected), value: row.projected }),
      child: (row) => ({ content: () => numberFormatter(row.projected) }),
    }),
    numericColumn<BeamNestedRow>({
      totals: (row) => numberFormatter(row.costToComplete),
      header: "Cost To Complete",
      grandparent: (row) => ({ content: () => maybeFormatNumber(row.costToComplete), value: row.costToComplete }),
      parent: (row) => ({ content: () => maybeFormatNumber(row.costToComplete), value: row.costToComplete }),
      child: (row) => ({ content: () => numberFormatter(row.costToComplete) }),
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
  const styleFixed = getTableStyles({ form: true });
  const styleFlexible = getTableStyles({ form: true, flexible: true });
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
