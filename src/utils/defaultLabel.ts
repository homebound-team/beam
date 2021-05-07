import { capitalCase } from "change-case";

export function defaultLabel(id: string): string {
  return capitalCase(id).replace(/Ids?$/, "");
}
