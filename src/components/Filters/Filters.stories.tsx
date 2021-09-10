import { Meta } from "@storybook/react";
import { useMemo } from "react";
import { InternalUser, Market, Project, ProjectFilter, Stage, Status } from "src/components/Filters/testDomain";
import {
  booleanFilter,
  FilterDefs,
  Filters,
  GridColumn,
  GridDataRow,
  GridTable,
  multiFilter,
  simpleHeader,
  SimpleHeaderAndDataOf,
  singleFilter,
  toggleFilter,
} from "src/components/index";
import { Css } from "src/Css";
import { usePersistedFilter } from "src/hooks";
import { useGroupBy } from "src/hooks/useGroupBy";
import { withBeamDecorator, withDimensions, withRouter, zeroTo } from "src/utils/sb";

export default {
  component: Filters,
  title: "Components/Filters",
  decorators: [withDimensions(), withRouter(), withBeamDecorator],
} as Meta;

export function Filter() {
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
      options: stages,
      label: "Stage",
      getOptionValue: (o) => o,
      getOptionLabel: (o) => (o === Stage.StageOne ? "One" : "Two"),
    });
    const status = multiFilter({
      options: statuses,
      label: "Status",
      getOptionValue: (o) => o.code,
      getOptionLabel: (o) => o.name,
    });

    const isTest = toggleFilter({ label: "Only show test projects" });

    const doNotUse = toggleFilter({ label: "Hide 'Do Not Show'", enabledValue: false });

    return {
      marketId,
      internalUserId,
      favorite,
      stage,
      status,
      isTest,
      doNotUse,
    };
  }, []);

  const { setFilter, filter } = usePersistedFilter<ProjectFilter>({
    storageKey: "storybookFilter",
    filterDefs,
  });

  return (
    <div css={Css.df.fdc.childGap5.$}>
      <div css={Css.df.fdc.childGap2.$}>
        <h1 css={Css.lg.$}>Filters</h1>
        <Filters<ProjectFilter> filter={filter} onChange={setFilter} filterDefs={filterDefs} />
      </div>
      <div>
        <strong>Applied Filter:</strong> {JSON.stringify(filter)}
      </div>
      <GridTable columns={columns} rows={filterRows(tableData, filter)} />
    </div>
  );
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
    <div css={Css.df.fdc.childGap2.$}>
      <Filters groupBy={groupBy} filter={filter} onChange={setFilter} filterDefs={filterDefs} />
      <strong>Applied Filter:</strong> {JSON.stringify(filter)}
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

type Row = SimpleHeaderAndDataOf<Project>;
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
      .map((p) => ({ kind: "data" as const, ...p })),
  ];
}
