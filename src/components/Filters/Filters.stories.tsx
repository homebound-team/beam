import { Meta } from "@storybook/react";
import { useMemo } from "react";
import {
  Development,
  InternalUser,
  Market,
  Project,
  ProjectFilter,
  Stage,
  Status,
} from "src/components/Filters/testDomain";
import { treeFilter } from "src/components/Filters/TreeFilter";
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
import { NestedOption } from "src/inputs";
import { HasIdAndName } from "src/types";
import { safeEntries } from "src/utils";
import { withBeamDecorator, withDimensions, withRouter, zeroTo } from "src/utils/sb";
import { checkboxFilter } from "./CheckboxFilter";

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

export function Filter(args: { vertical: boolean | undefined; numberOfInlineFilters: number | undefined }) {
  return <TestFilterPage {...args} />;
}

Filter.args = {
  numberOfInlineFilters: 4,
};

export function Vertical() {
  return <TestFilterPage vertical={true} />;
}

export function GroupBy(args: { vertical: boolean | undefined; numberOfInlineFilters: number | undefined }) {
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
      <Filters
        groupBy={groupBy}
        filter={filter}
        onChange={setFilter}
        filterDefs={filterDefs}
        numberOfInlineFilters={args.numberOfInlineFilters}
      />
      <strong>Applied Filter:</strong> {JSON.stringify(filter)}
    </div>
  );
}

GroupBy.args = {
  numberOfInlineFilters: 4,
};

function TestFilterPage({ vertical = false, numberOfInlineFilters = 4 }) {
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
    const isStale = checkboxFilter({ label: "Stale" });

    const groupedProjects: NestedOption<HasIdAndName>[] = developments.map(({ id, name, cohorts }) => ({
      id,
      name,
      children: cohorts.map(({ id, name, projects }) => ({
        id,
        name,
        children: projects.map(({ id, name }) => ({ id, name })),
      })),
    }));

    const projectCohortDevelopment = treeFilter({
      label: "Project Cohort or Development",
      options: groupedProjects,
      getOptionValue: (o) => o.id,
      getOptionLabel: (o) => o.name,
    });

    return {
      marketId,
      internalUserId,
      numRangeFilter,
      favorite,
      projectCohortDevelopment,
      stage,
      status,
      date,
      dateRange,
      isTest,
      doNotUse,
      isStale,
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
            numberOfInlineFilters={numberOfInlineFilters}
          />
        </div>
      </div>
      <div css={Css.fg1.$}>
        <strong>Applied Filter:</strong> {JSON.stringify(filter)}
        <GridTable columns={columns} rows={filterRows(projects, filter)} />
      </div>
    </div>
  );
}

const internalUsers: InternalUser[] = zeroTo(10).map((i) => ({ id: `${i + 1}`, name: `Employee ${i + 1}` }));
const markets: Market[] = zeroTo(5).map((i) => ({ code: `${i + 1}`, name: `Market ${i + 1}` }));
const stages: Stage[] = [Stage.StageOne, Stage.StageTwo];
const statuses: Status[] = zeroTo(4).map((i) => ({ code: `${i + 1}`, name: `Status ${i + 1}` }));
const developments: Development[] = zeroTo(2).map((devIdx) => ({
  id: `dev:${devIdx + 1}`,
  name: `Development ${devIdx + 1}`,
  cohorts: zeroTo(2).map((cohortIdx) => ({
    id: `cohort:${cohortIdx + 1}:dev:${devIdx + 1}`,
    name: `Cohort ${cohortIdx + 1}`,
    projects: zeroTo(4).map((pIdx) => ({
      id: `p:${pIdx + 1}:cohort:${cohortIdx + 1}:dev:${devIdx + 1}`,
      name: `Project ${pIdx + 1}`,
      market: markets[cohortIdx + devIdx],
      internalUser: internalUsers[(pIdx + cohortIdx + devIdx) % internalUsers.length],
      favorite: (pIdx + cohortIdx + devIdx) % 2 === 0,
      stage: stages[pIdx % stages.length],
      status: statuses[pIdx % statuses.length],
      isTest: (pIdx + cohortIdx) % 2 === 0,
      doNotUse: (pIdx + cohortIdx - devIdx) % 2 === 0,
      isStale: (pIdx + cohortIdx + 1) % 2 === 0,
    })),
  })),
}));

const projects: Project[] = developments.flatMap((dev) => dev.cohorts.flatMap((cohort) => cohort.projects));

type Row = SimpleHeaderAndData<Project>;
const columns: GridColumn<Row>[] = [
  { header: () => "Project", data: ({ name }) => name },
  { header: () => "Project Manager", data: ({ internalUser }) => internalUser.name },
  { header: () => "Market", data: ({ market }) => market.name },
  { header: () => "Favorite", data: ({ favorite }) => (favorite ? "Yes" : "No") },
  { header: () => "Stage", data: ({ stage }) => (stage === Stage.StageOne ? "One" : "Two") },
  { header: () => "Status", data: ({ status }) => status.name },
  { header: () => "Is Test", data: ({ isTest }) => (isTest ? "Yes" : "No") },
  { header: () => "Do not use", data: ({ doNotUse }) => (doNotUse ? "True" : "False") },
  { header: () => "Is Stale", data: ({ isStale }) => (isStale ? "True" : "False") },
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
      .filter((p) => (filter.isStale ? p.isStale : true))
      .map((p) => ({ kind: "data" as const, id: p.id, data: p })),
  ];
}
