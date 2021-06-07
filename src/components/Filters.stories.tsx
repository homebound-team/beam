import { Meta } from "@storybook/react";
import { Filters, GridColumn, GridDataRow, GridTable, simpleHeader, SimpleHeaderAndDataOf } from "src/components";
import { Css } from "src/Css";
import { useFilter } from "src/hooks";
import { withRouter, zeroTo } from "src/utils/sb";
import { withPerformance } from "storybook-addon-performance";

export default {
  component: Filters,
  title: "Components/Filters",
  decorators: [withPerformance, withRouter()],
} as Meta;

export function Filter() {
  const defaultFilter: ProjectFilter = { marketId: ["1"], internalUserId: ["4"] };
  const { setFilter, queryFilter } = useFilter<ProjectFilter>({ defaultFilter, storageKey: "storybookFilter" });

  return (
    <div css={Css.df.flexColumn.childGap5.$}>
      <div css={Css.df.flexColumn.childGap2.$}>
        <h1 css={Css.lg.$}>Filters</h1>
        <Filters<ProjectFilter>
          onApply={setFilter}
          filterDefs={{
            marketId: {
              kind: "multi",
              options: markets,
              values: queryFilter.marketId ?? [],
              label: "Market",
              getOptionValue: (o: any) => o.code,
              getOptionLabel: (o: any) => o.name,
            },
            internalUserId: {
              kind: "multi",
              options: internalUsers,
              values: queryFilter.internalUserId ?? [],
              label: "Project Manager",
              getOptionValue: (o: any) => o.id,
              getOptionLabel: (o: any) => o.name,
            },
          }}
        />
      </div>
      <GridTable columns={columns} rows={filterRows(tableData, queryFilter)} />
    </div>
  );
}

const internalUsers: InternalUser[] = zeroTo(10).map((i) => ({ id: `${i + 1}`, name: `Employee ${i + 1}` }));
const markets: Market[] = zeroTo(5).map((i) => ({ code: `${i + 1}`, name: `Market ${i + 1}` }));
const tableData: Project[] = [
  { id: "1", market: markets[0], internalUser: internalUsers[4] },
  { id: "2", market: markets[2], internalUser: internalUsers[9] },
  { id: "3", market: markets[1], internalUser: internalUsers[1] },
  { id: "4", market: markets[4], internalUser: internalUsers[0] },
  { id: "5", market: markets[2], internalUser: internalUsers[1] },
  { id: "6", market: markets[3], internalUser: internalUsers[1] },
  { id: "7", market: markets[2], internalUser: internalUsers[2] },
  { id: "8", market: markets[3], internalUser: internalUsers[5] },
  { id: "9", market: markets[4], internalUser: internalUsers[7] },
  { id: "10", market: markets[0], internalUser: internalUsers[8] },
  { id: "11", market: markets[0], internalUser: internalUsers[3] },
  { id: "12", market: markets[0], internalUser: internalUsers[5] },
  { id: "13", market: markets[1], internalUser: internalUsers[3] },
  { id: "14", market: markets[3], internalUser: internalUsers[1] },
  { id: "15", market: markets[4], internalUser: internalUsers[2] },
  { id: "16", market: markets[4], internalUser: internalUsers[4] },
  { id: "17", market: markets[2], internalUser: internalUsers[8] },
  { id: "18", market: markets[1], internalUser: internalUsers[4] },
  { id: "19", market: markets[3], internalUser: internalUsers[8] },
  { id: "20", market: markets[0], internalUser: internalUsers[0] },
];

type Row = SimpleHeaderAndDataOf<Project>;
const columns: GridColumn<Row>[] = [
  { header: () => "Project Manager", data: ({ internalUser }) => internalUser.name },
  { header: () => "Market", data: ({ market }) => market.name },
];

function filterRows(data: Project[], filter: ProjectFilter): GridDataRow<Row>[] {
  debugger;
  return [
    simpleHeader,
    ...data
      .filter((p) => (filter.internalUserId?.length ? filter.internalUserId.includes(p.internalUser.id) : true))
      .filter((p) => (filter.marketId?.length ? filter.marketId.includes(p.market.code) : true))
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

type ProjectFilter = { marketId?: string[]; internalUserId?: string[] };

type Project = {
  id: string;
  internalUser: InternalUser;
  market: Market;
};
