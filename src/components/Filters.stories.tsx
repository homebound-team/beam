import { Meta } from "@storybook/react";
import {
  booleanFilter,
  FilterDef,
  Filters,
  GridColumn,
  GridDataRow,
  GridTable,
  multiFilter,
  simpleHeader,
  SimpleHeaderAndDataOf,
} from "src/components";
import { Css } from "src/Css";
import { usePersistedFilter } from "src/hooks";
import { withRouter, zeroTo } from "src/utils/sb";
import { withPerformance } from "storybook-addon-performance";

export default {
  component: Filters,
  title: "Components/Filters",
  decorators: [withPerformance, withRouter()],
} as Meta;

export function Filter() {
  const defaultFilter: ProjectFilter = {};
  const marketId = multiFilter({
    options: markets,
    label: "Market",
    getOptionValue: (o: any) => o.code,
    getOptionLabel: (o: any) => o.name,
  });
  const internalUserId = multiFilter({
    options: internalUsers,
    label: "Project Manager",
    getOptionValue: (o: any) => o.id,
    getOptionLabel: (o: any) => o.name,
  });
  const favorite = booleanFilter({
    options: [
      [undefined, "All"],
      [true, "Favorited"],
      [false, "Not favorited"],
    ],
    label: "Favorite Status",
  });

  const filterDefs: { [K in keyof ProjectFilter]: FilterDef<any> } = {
    marketId,
    internalUserId,
    favorite,
  };
  const { setFilter, filter } = usePersistedFilter<ProjectFilter>({
    defaultFilter,
    storageKey: "storybookFilter",
    filterDefs,
  });

  return (
    <div css={Css.df.flexColumn.childGap5.$}>
      <div css={Css.df.flexColumn.childGap2.$}>
        <h1 css={Css.lg.$}>Filters</h1>
        <Filters<ProjectFilter> filter={filter} onApply={setFilter} filterDefs={filterDefs} />
      </div>
      <GridTable columns={columns} rows={filterRows(tableData, filter)} />
    </div>
  );
}

const internalUsers: InternalUser[] = zeroTo(10).map((i) => ({ id: `${i + 1}`, name: `Employee ${i + 1}` }));
const markets: Market[] = zeroTo(5).map((i) => ({ code: `${i + 1}`, name: `Market ${i + 1}` }));
const tableData: Project[] = [
  { id: "1", market: markets[0], internalUser: internalUsers[4], favorite: true },
  { id: "2", market: markets[2], internalUser: internalUsers[9], favorite: true },
  { id: "3", market: markets[1], internalUser: internalUsers[1], favorite: false },
  { id: "4", market: markets[4], internalUser: internalUsers[0], favorite: true },
  { id: "5", market: markets[2], internalUser: internalUsers[1], favorite: true },
  { id: "6", market: markets[3], internalUser: internalUsers[1], favorite: false },
  { id: "7", market: markets[2], internalUser: internalUsers[2], favorite: true },
  { id: "8", market: markets[3], internalUser: internalUsers[5], favorite: true },
  { id: "9", market: markets[4], internalUser: internalUsers[7], favorite: false },
  { id: "10", market: markets[0], internalUser: internalUsers[8], favorite: false },
  { id: "11", market: markets[0], internalUser: internalUsers[3], favorite: true },
  { id: "12", market: markets[0], internalUser: internalUsers[5], favorite: false },
  { id: "13", market: markets[1], internalUser: internalUsers[3], favorite: true },
  { id: "14", market: markets[3], internalUser: internalUsers[1], favorite: false },
  { id: "15", market: markets[4], internalUser: internalUsers[2], favorite: true },
  { id: "16", market: markets[4], internalUser: internalUsers[4], favorite: false },
  { id: "17", market: markets[2], internalUser: internalUsers[8], favorite: false },
  { id: "18", market: markets[1], internalUser: internalUsers[4], favorite: false },
  { id: "19", market: markets[3], internalUser: internalUsers[8], favorite: false },
  { id: "20", market: markets[0], internalUser: internalUsers[0], favorite: false },
];

type Row = SimpleHeaderAndDataOf<Project>;
const columns: GridColumn<Row>[] = [
  { header: () => "Project Manager", data: ({ internalUser }) => internalUser.name },
  { header: () => "Market", data: ({ market }) => market.name },
  { header: () => "Favorite", data: ({ favorite }) => (favorite ? "Yes" : "No") },
];

function filterRows(data: Project[], filter: ProjectFilter): GridDataRow<Row>[] {
  return [
    simpleHeader,
    ...data
      .filter((p) => (filter.internalUserId?.length ? filter.internalUserId.includes(p.internalUser.id) : true))
      .filter((p) => (filter.marketId?.length ? filter.marketId.includes(p.market.code) : true))
      .filter((p) => (filter.favorite !== undefined ? filter.favorite === p.favorite : true))
      .map((p) => ({ kind: "data" as const, ...p })),
  ];
}

type Market = {
  code: string;
  name: string;
};

type InternalUser = {
  name: string;
  id: string;
};

type ProjectFilter = { marketId?: string[]; internalUserId?: string[]; favorite?: boolean };

type Project = {
  id: string;
  internalUser: InternalUser;
  market: Market;
  favorite: boolean;
};
