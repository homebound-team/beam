// Import and re-export DateRange type so other apps do not need a direct dependency on react-day-picker
import React from "react";
import { DateRange as _DateRange } from "react-day-picker";
export type { _DateRange as DateRange };

export type HasIdAndName<V = string> = { id: V; name: string };
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export type CheckFn = () => boolean;
export type CanCloseCheck = { check: CheckFn; discardText?: string; continueText?: string } | CheckFn;
export function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}
export type AnyObject = Record<string, unknown>;
export type ChildrenOnly = { children: React.ReactNode };
