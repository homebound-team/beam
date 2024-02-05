import { fail } from "src/utils";

// This `any` is currently on purpose to ignore type errors in ChipSelectField
export function defaultOptionValue<O>(opt: O): any {
  if (typeof opt !== "object" || !opt) fail(`Option ${opt} has no id or code`);
  // Use `in` because returning undefined is fine
  return "id" in opt ? opt.id : "code" in opt ? opt.code : fail(`Option ${JSON.stringify(opt)} has no id or code`);
}

export function defaultOptionLabel<O>(opt: O): any {
  if (typeof opt !== "object" || !opt) fail(`Option ${opt} has no id or code`);
  // Use `in` because returning undefined is fine
  return "displayName" in opt
    ? opt.displayName
    : "label" in opt
    ? opt.label
    : "name" in opt
    ? opt.name
    : fail(`Option ${JSON.stringify(opt)} has no displayName, label, or name`);
}
