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
};

export type ProjectFilter = {
  marketId?: string[] | null;
  internalUserId?: string | null;
  favorite?: boolean | null;
  stage?: Stage[] | null;
  stageSingle?: Stage | null;
  status?: string[] | null;
  isTest?: boolean | null;
};
