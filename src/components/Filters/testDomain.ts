import { multiFilter } from "src/components/Filters/MultiSelectFilter";
import { singleFilter } from "src/components/Filters/SingleSelectFilter";
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
};

export type StageFilter = FilterDefs<ProjectFilter>["stage"];
export type StageSingleFilter = FilterDefs<ProjectFilter>["stageSingle"];

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
