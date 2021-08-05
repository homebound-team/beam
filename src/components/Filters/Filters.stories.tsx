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
} from "src/components/index";
import { Css } from "src/Css";
import { usePersistedFilter } from "src/hooks";
import { withBeamDecorator, withDimensions, withRouter, zeroTo } from "src/utils/sb";

export default {
  component: Filters,
  title: "Components/Filters",
  decorators: [withDimensions(), withRouter(), withBeamDecorator],
} as Meta;

export function Filter() {
  const defaultFilter: ProjectFilter = {};

  const filterDefs: FilterDefs<ProjectFilter> = useMemo(() => {
    const marketId = multiFilter({
      options: markets,
      label: "Market",
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

    return {
      marketId,
      internalUserId,
      favorite,
      stage,
      status,
    };
  }, []);

  const { setFilter, filter } = usePersistedFilter<ProjectFilter>({
    defaultFilter,
    storageKey: "storybookFilter",
    filterDefs,
  });

  return (
    <div css={Css.df.flexColumn.childGap5.$}>
      <div css={Css.df.flexColumn.childGap2.$}>
        <h1 css={Css.lg.$}>Filters</h1>
        <Filters<ProjectFilter> filter={filter} onChange={setFilter} filterDefs={filterDefs} />
      </div>
      <GridTable columns={columns} rows={filterRows(tableData, filter)} />
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
  },
  {
    id: "2",
    market: markets[2],
    internalUser: internalUsers[9],
    favorite: true,
    stage: stages[2],
    status: statuses[1],
  },
  {
    id: "3",
    market: markets[1],
    internalUser: internalUsers[1],
    favorite: false,
    stage: stages[1],
    status: statuses[1],
  },
  {
    id: "4",
    market: markets[4],
    internalUser: internalUsers[0],
    favorite: true,
    stage: stages[0],
    status: statuses[0],
  },
  {
    id: "5",
    market: markets[2],
    internalUser: internalUsers[1],
    favorite: true,
    stage: stages[1],
    status: statuses[2],
  },
  {
    id: "6",
    market: markets[3],
    internalUser: internalUsers[1],
    favorite: false,
    stage: stages[0],
    status: statuses[2],
  },
  {
    id: "7",
    market: markets[2],
    internalUser: internalUsers[2],
    favorite: true,
    stage: stages[2],
    status: statuses[0],
  },
  {
    id: "8",
    market: markets[3],
    internalUser: internalUsers[5],
    favorite: true,
    stage: stages[0],
    status: statuses[2],
  },
  {
    id: "9",
    market: markets[4],
    internalUser: internalUsers[7],
    favorite: false,
    stage: stages[2],
    status: statuses[1],
  },
  {
    id: "10",
    market: markets[0],
    internalUser: internalUsers[8],
    favorite: false,
    stage: stages[1],
    status: statuses[1],
  },
  {
    id: "11",
    market: markets[0],
    internalUser: internalUsers[3],
    favorite: true,
    stage: stages[1],
    status: statuses[0],
  },
  {
    id: "12",
    market: markets[0],
    internalUser: internalUsers[5],
    favorite: false,
    stage: stages[2],
    status: statuses[0],
  },
  {
    id: "13",
    market: markets[1],
    internalUser: internalUsers[3],
    favorite: true,
    stage: stages[0],
    status: statuses[2],
  },
  {
    id: "14",
    market: markets[3],
    internalUser: internalUsers[1],
    favorite: false,
    stage: stages[0],
    status: statuses[1],
  },
  {
    id: "15",
    market: markets[4],
    internalUser: internalUsers[2],
    favorite: true,
    stage: stages[1],
    status: statuses[0],
  },
  {
    id: "16",
    market: markets[4],
    internalUser: internalUsers[4],
    favorite: false,
    stage: stages[0],
    status: statuses[1],
  },
  {
    id: "17",
    market: markets[2],
    internalUser: internalUsers[8],
    favorite: false,
    stage: stages[2],
    status: statuses[2],
  },
  {
    id: "18",
    market: markets[1],
    internalUser: internalUsers[4],
    favorite: false,
    stage: stages[1],
    status: statuses[0],
  },
  {
    id: "19",
    market: markets[3],
    internalUser: internalUsers[8],
    favorite: false,
    stage: stages[1],
    status: statuses[2],
  },
  {
    id: "20",
    market: markets[0],
    internalUser: internalUsers[0],
    favorite: false,
    stage: stages[0],
    status: statuses[0],
  },
];

type Row = SimpleHeaderAndDataOf<Project>;
const columns: GridColumn<Row>[] = [
  { header: () => "Project Manager", data: ({ internalUser }) => internalUser.name },
  { header: () => "Market", data: ({ market }) => market.name },
  { header: () => "Favorite", data: ({ favorite }) => (favorite ? "Yes" : "No") },
  { header: () => "Stage", data: ({ stage }) => (stage === Stage.StageOne ? "One" : "Two") },
  { header: () => "Status", data: ({ status }) => status.name },
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
      .map((p) => ({ kind: "data" as const, ...p })),
  ];
}
