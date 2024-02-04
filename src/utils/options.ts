import { fail } from "src/utils";

// This `any` is currently on purpose to ignore type errors in ChipSelectField
export function defaultOptionValue<O>(opt: O): any {
  const o = opt as any;
  return o.id ?? o.code ?? fail("Option has no id or code");
}

export function defaultOptionLabel<O>(opt: O): string {
  const o = opt as any;
  return o.displayName ?? o.label ?? o.name ?? fail("Option has no displayName, label, or name");
}
