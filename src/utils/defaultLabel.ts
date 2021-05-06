import { capitalCase } from "change-case";

export function defaultLabel(id: string | undefined): string | undefined {
  return id ? capitalCase(id).replace(/Ids?$/, "") : undefined;
}
