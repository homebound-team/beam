import { dateFilter, DateFilterValue } from "src/components/Filters/DateFilter";
import { dateRangeFilter, DateRangeFilterValue } from "src/components/Filters/DateRangeFilter";
import { multiFilter } from "src/components/Filters/MultiFilter";
import { singleFilter } from "src/components/Filters/SingleFilter";
import { FilterDefs } from "src/components/Filters/types";
import { NumberRangeFilterValue } from "./NumberRangeFilter";

export enum Stage {
  StageOne = "ONE",
  StageTwo = "TWO",
}

export type Market = {
  code: string;
  name: string;
};

export type InternalUser = {
  name: string;
  id: string;
  role?: string;
};

export type Status = {
  code: string;
  name: string;
};

export type Project = {
  name: string;
  id: string;
  internalUser: InternalUser;
  market: Market;
  favorite: boolean;
  stage: Stage;
  status: Status;
  isTest: boolean;
  doNotUse: boolean;
  isStale: boolean;
};

export type Cohort = {
  id: string;
  name: string;
  projects: Project[];
};

export type Development = {
  id: string;
  name: string;
  cohorts: Cohort[];
};

export type ProjectFilter = {
  marketId?: string[] | null;
  internalUserId?: string | null;
  favorite?: boolean | null;
  stage?: Stage[] | null;
  stageSingle?: Stage | null;
  status?: string[] | null;
  isTest?: boolean | null;
  doNotUse?: boolean | null;
  date?: DateFilterValue<string>;
  dateRange?: DateRangeFilterValue<string>;
  numberRange?: NumberRangeFilterValue;
  isStale?: boolean | null;
  projectCohortDevelopment?: string[];
};

export type StageFilter = NonNullable<FilterDefs<ProjectFilter>["stage"]>;
export type StageSingleFilter = NonNullable<FilterDefs<ProjectFilter>["stageSingle"]>;
export type DateFilter = NonNullable<FilterDefs<ProjectFilter>["date"]>;
export type DateRangeFilter = NonNullable<FilterDefs<ProjectFilter>["dateRange"]>;

const stageOptions = [
  { code: Stage.StageOne, name: "One" },
  { code: Stage.StageTwo, name: "Two" },
];

export const stageFilter: StageFilter = multiFilter({
  options: stageOptions,
  getOptionValue: (s) => s.code,
  getOptionLabel: (s) => s.name,
});

export const stageFilterDisabledOptions: StageFilter = multiFilter({
  options: stageOptions,
  getOptionValue: (s) => s.code,
  getOptionLabel: (s) => s.name,
  disabledOptions: [{ value: Stage.StageOne, reason: "I have a reason to be disabled." }, Stage.StageTwo],
});

export const stageSingleFilter: StageSingleFilter = singleFilter({
  options: stageOptions,
  getOptionValue: (s) => s.code,
  getOptionLabel: (s) => s.name,
});

export const stageFilterWithNothingSelectedText: StageSingleFilter = singleFilter({
  options: stageOptions,
  getOptionValue: (s) => s.code,
  getOptionLabel: (s) => s.name,
  nothingSelectedText: "All Stages",
});

export const taskDueFilter: DateFilter = dateFilter({
  operations: [
    { label: "On", value: "ON" },
    { label: "Before", value: "BEFORE" },
    { label: "After", value: "AFTER" },
  ],
  label: "Task Due",
  getOperationLabel: (o) => o.label,
  getOperationValue: (o) => o.value,
});

export const taskCompleteFilter: DateRangeFilter = dateRangeFilter({
  label: "Task Completed",
  placeholderText: "This is some placeholder text",
});

export enum TaskStatus {
  NotStarted = "NOT_STARTED",
  InProgress = "IN_PROGRESS",
  Complete = "COMPLETE",
  Deactivated = "DEACTIVATED",
  OnHold = "ON_HOLD",
  Delayed = "DELAYED",
}

export enum ScheduleTypes {
  Task = "TASK",
  Milestone = "MILESTONE",
}
