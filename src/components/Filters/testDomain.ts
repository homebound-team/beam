import { dateFilter, DateFilterValue } from "src/components/Filters/DateFilter";
import { multiFilter } from "src/components/Filters/MultiFilter";
import { singleFilter } from "src/components/Filters/SingleFilter";
import { FilterDefs } from "src/components/Filters/types";

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
  id: string;
  internalUser: InternalUser;
  market: Market;
  favorite: boolean;
  stage: Stage;
  status: Status;
  isTest: boolean;
  doNotUse: boolean;
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
};

export type StageFilter = NonNullable<FilterDefs<ProjectFilter>["stage"]>;
export type StageSingleFilter = NonNullable<FilterDefs<ProjectFilter>["stageSingle"]>;
export type DateFilter = NonNullable<FilterDefs<ProjectFilter>["date"]>;

const stageOptions = [
  { code: Stage.StageOne, name: "One" },
  { code: Stage.StageTwo, name: "Two" },
];

export const stageFilter: StageFilter = multiFilter({
  options: stageOptions,
  getOptionValue: (s) => s.code,
  getOptionLabel: (s) => s.name,
});

export const stageSingleFilter: StageSingleFilter = singleFilter({
  options: stageOptions,
  getOptionValue: (s) => s.code,
  getOptionLabel: (s) => s.name,
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

export enum TaskStatus {
  NotStarted = "NOT_STARTED",
  InProgress = "IN_PROGRESS",
  Complete = "COMPLETE",
  Deactivated = "DEACTIVATED",
  OnHold = "ON_HOLD",
  Delayed = "DELAYED",
}
