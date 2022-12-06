import { Meta } from "@storybook/react";
import { useMemo } from "react";
import { InternalUser, Market, Project, ProjectFilter, Stage, Status } from "src/components/Filters/testDomain";
import {
  booleanFilter,
  dateFilter,
  dateRangeFilter,
  FilterDefs,
  Filters,
  GridColumn,
  GridDataRow,
  GridTable,
  multiFilter,
  numberRangeFilter,
  simpleHeader,
  SimpleHeaderAndData,
  singleFilter,
  toggleFilter,
} from "src/components/index";
import { Css } from "src/Css";
import { jan1, jan19 } from "src/forms/formStateDomain";
import { usePersistedFilter } from "src/hooks";
import { useGroupBy } from "src/hooks/useGroupBy";
import { safeEntries } from "src/utils";
import { withBeamDecorator, withDimensions, withRouter, zeroTo } from "src/utils/sb";

export default {
  component: Filters,
  title: "Workspace/Components/Filter",
  decorators: [withDimensions(), withRouter(), withBeamDecorator],
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=34522%3A101334",
    },
  },
} as Meta;

export function Filter() {
  return <TestFilterPage />;
}

export function Vertical() {
  return <TestFilterPage vertical />;
}

export function GroupBy() {
  const groupBy = useGroupBy({ costCode: "Cost Code", tradeCategory: "Trade Category" });
  type Filter = ProjectFilter & { view: string };
  const filterDefs: FilterDefs<Filter> = useMemo(() => {
    return {
      view: singleFilter({
        options: [{ id: "selections", name: "Selections" }],
        getOptionValue: (o) => o.id,
        getOptionLabel: (o) => o.name,
      }),
      marketId: multiFilter({
        options: markets,
        getOptionValue: (o) => o.code,
        getOptionLabel: (o) => o.name,
      }),
    };
  }, []);
  const { setFilter, filter } = usePersistedFilter<ProjectFilter>({
    storageKey: "GroupBy",
    filterDefs,
  });
  return (
    <div css={Css.df.fdc.gap2.$}>
      <Filters groupBy={groupBy} filter={filter} onChange={setFilter} filterDefs={filterDefs} />
      <strong>Applied Filter:</strong> {JSON.stringify(filter)}
    </div>
  );
}

function TestFilterPage({ vertical }: { vertical?: boolean }) {
  const filterDefs: FilterDefs<ProjectFilter> = useMemo(() => {
    const marketId = multiFilter({
      options: markets,
      getOptionValue: (o) => o.code,
      getOptionLabel: (o) => o.name,
    });
    const internalUserId = singleFilter({
      options: internalUsers,
      label: "Project Manager",
      getOptionValue: (o) => o.id,
      getOptionLabel: (o) => o.name,
    });
    const favorite = booleanFilter({
      options: [
        [undefined, "All"],
        [true, "Favorited"],
        [false, "Not favorited"],
      ],
      label: "Favorite Status",
      defaultValue: true,
    });
    const stage = multiFilter({
      // Need to use `safeEntries`, otherwise we get a "Weak Map" error in MultiSelectField.
      options: safeEntries(stages),
      label: "Stage",
      // Getting odd types back from safeEntries, can be a `number | [number | Stage] | () => some iterator... soo kind of hacky here.
      getOptionValue: (o) => (typeof o === "object" ? o[1] : Stage.StageOne),
      getOptionLabel: (o) => (typeof o === "object" ? (o[1] === Stage.StageOne ? "One" : "Two") : Stage.StageOne),
    });
    const status = multiFilter({
      options: statuses,
      label: "Status",
      getOptionValue: (o) => o.code,
      getOptionLabel: (o) => o.name,
    });

    const date = dateFilter({
      operations: [
        { label: "On", value: "ON" },
        { label: "Before", value: "BEFORE" },
        { label: "After", value: "AFTER" },
      ],
      label: "Task Due",
      getOperationLabel: (o) => o.label,
      getOperationValue: (o) => o.value,
      // Providing a default value, otherwise the default date in the DateField will be today's date, which will cause storybook diffs every day.
      defaultValue: { op: "BEFORE", value: jan1 },
    });

    const dateRange = dateRangeFilter({
      label: "Completion Estimate Range",
      testFieldLabel: "Dates",
      placeholderText: "All",
      // Providing a default value, otherwise the default date in the DateField will be today's date, which will cause storybook diffs every day.
      defaultValue: { op: "BETWEEN", value: { from: jan1, to: jan19 } },
    });

    const numRangeFilter = numberRangeFilter({ label: "Price", numberFieldType: "cents" });

    const isTest = toggleFilter({ label: "Only show test projects" });
    const doNotUse = toggleFilter({ label: "Hide 'Do Not Show'", onValue: false });

    return {
      marketId,
      internalUserId,
      numRangeFilter,
      favorite,
      stage,
      status,
      date,
      dateRange,
      isTest,
      doNotUse,
    };
  }, []);

  const { setFilter, filter } = usePersistedFilter<ProjectFilter>({
    storageKey: "storybookFilter",
    filterDefs,
  });

  return (
    <div
      css={{
        ...(vertical ? Css.df.gap2.$ : Css.df.fdc.gap5.$),
      }}
    >
      <div>
        <div css={Css.df.fdc.gap2.if(!!vertical).wPx(360).p2.bgGray100.br.bGray600.$}>
          <h1 css={Css.lg.$}>Filters</h1>
          <Filters<ProjectFilter>
            filter={filter}
            onChange={setFilter}
            filterDefs={filterDefs}
            vertical={vertical}
            moreFilters={4}
          />
        </div>
      </div>
      <div css={Css.fg1.$}>
        <strong>Applied Filter:</strong> {JSON.stringify(filter)}
        <GridTable columns={columns} rows={filterRows(tableData, filter)} />
      </div>
    </div>
  );
}

const internalUsers: InternalUser[] = zeroTo(10).map((i) => ({ id: `${i + 1}`, name: `Employee ${i + 1}` }));
const markets: Market[] = zeroTo(5).map((i) => ({ code: `${i + 1}`, name: `Market ${i + 1}` }));
const stages: Stage[] = [Stage.StageOne, Stage.StageTwo];
const statuses: Status[] = zeroTo(4).map((i) => ({ code: `${i + 1}`, name: `Status ${i + 1}` }));
const tableData: Project[] = [
  {
    id: "1",
    market: markets[0],
    internalUser: internalUsers[4],
    favorite: true,
    stage: stages[0],
    status: statuses[0],
    isTest: false,
    doNotUse: true,
  },
  {
    id: "2",
    market: markets[2],
    internalUser: internalUsers[9],
    favorite: true,
    stage: stages[2],
    status: statuses[1],
    isTest: true,
    doNotUse: false,
  },
  {
    id: "3",
    market: markets[1],
    internalUser: internalUsers[1],
    favorite: false,
    stage: stages[1],
    status: statuses[1],
    isTest: false,
    doNotUse: false,
  },
  {
    id: "4",
    market: markets[4],
    internalUser: internalUsers[0],
    favorite: true,
    stage: stages[0],
    status: statuses[0],
    isTest: false,
    doNotUse: false,
  },
  {
    id: "5",
    market: markets[2],
    internalUser: internalUsers[1],
    favorite: true,
    stage: stages[1],
    status: statuses[2],
    isTest: false,
    doNotUse: false,
  },
  {
    id: "6",
    market: markets[3],
    internalUser: internalUsers[1],
    favorite: false,
    stage: stages[0],
    status: statuses[2],
    isTest: true,
    doNotUse: false,
  },
  {
    id: "7",
    market: markets[2],
    internalUser: internalUsers[2],
    favorite: true,
    stage: stages[2],
    status: statuses[0],
    isTest: false,
    doNotUse: false,
  },
  {
    id: "8",
    market: markets[3],
    internalUser: internalUsers[5],
    favorite: true,
    stage: stages[0],
    status: statuses[2],
    isTest: false,
    doNotUse: true,
  },
  {
    id: "9",
    market: markets[4],
    internalUser: internalUsers[7],
    favorite: false,
    stage: stages[2],
    status: statuses[1],
    isTest: true,
    doNotUse: false,
  },
  {
    id: "10",
    market: markets[0],
    internalUser: internalUsers[8],
    favorite: false,
    stage: stages[1],
    status: statuses[1],
    isTest: false,
    doNotUse: false,
  },
  {
    id: "11",
    market: markets[0],
    internalUser: internalUsers[3],
    favorite: true,
    stage: stages[1],
    status: statuses[0],
    isTest: false,
    doNotUse: false,
  },
  {
    id: "12",
    market: markets[0],
    internalUser: internalUsers[5],
    favorite: false,
    stage: stages[2],
    status: statuses[0],
    isTest: false,
    doNotUse: false,
  },
  {
    id: "13",
    market: markets[1],
    internalUser: internalUsers[3],
    favorite: true,
    stage: stages[0],
    status: statuses[2],
    isTest: true,
    doNotUse: true,
  },
  {
    id: "14",
    market: markets[3],
    internalUser: internalUsers[1],
    favorite: false,
    stage: stages[0],
    status: statuses[1],
    isTest: true,
    doNotUse: false,
  },
  {
    id: "15",
    market: markets[4],
    internalUser: internalUsers[2],
    favorite: true,
    stage: stages[1],
    status: statuses[0],
    isTest: false,
    doNotUse: false,
  },
  {
    id: "16",
    market: markets[4],
    internalUser: internalUsers[4],
    favorite: false,
    stage: stages[0],
    status: statuses[1],
    isTest: false,
    doNotUse: false,
  },
  {
    id: "17",
    market: markets[2],
    internalUser: internalUsers[8],
    favorite: false,
    stage: stages[2],
    status: statuses[2],
    isTest: false,
    doNotUse: false,
  },
  {
    id: "18",
    market: markets[1],
    internalUser: internalUsers[4],
    favorite: false,
    stage: stages[1],
    status: statuses[0],
    isTest: false,
    doNotUse: false,
  },
  {
    id: "19",
    market: markets[3],
    internalUser: internalUsers[8],
    favorite: false,
    stage: stages[1],
    status: statuses[2],
    isTest: false,
    doNotUse: false,
  },
  {
    id: "20",
    market: markets[0],
    internalUser: internalUsers[0],
    favorite: false,
    stage: stages[0],
    status: statuses[0],
    isTest: true,
    doNotUse: false,
  },
];

type Row = SimpleHeaderAndData<Project>;
const columns: GridColumn<Row>[] = [
  { header: () => "Project Manager", data: ({ internalUser }) => internalUser.name },
  { header: () => "Market", data: ({ market }) => market.name },
  { header: () => "Favorite", data: ({ favorite }) => (favorite ? "Yes" : "No") },
  { header: () => "Stage", data: ({ stage }) => (stage === Stage.StageOne ? "One" : "Two") },
  { header: () => "Status", data: ({ status }) => status.name },
  { header: () => "Is Test", data: ({ isTest }) => (isTest ? "Yes" : "No") },
  { header: () => "Do not use", data: ({ doNotUse }) => (doNotUse ? "True" : "False") },
];

function filterRows(data: Project[], filter: ProjectFilter): GridDataRow<Row>[] {
  return [
    simpleHeader,
    ...data
      .filter((p) => (filter.internalUserId?.length ? filter.internalUserId.includes(p.internalUser.id) : true))
      .filter((p) => (filter.marketId?.length ? filter.marketId.includes(p.market.code) : true))
      .filter((p) => (filter.stage?.length ? filter.stage.includes(p.stage) : true))
      .filter((p) => (filter.status?.length ? filter.status.includes(p.status.code) : true))
      .filter((p) => (filter.favorite !== undefined ? filter.favorite === p.favorite : true))
      .filter((p) => (filter.isTest ? p.isTest : true))
      .filter((p) => (filter.doNotUse === undefined ? true : !p.doNotUse))
      .map((p) => ({ kind: "data" as const, id: p.id, data: p })),
  ];
}
