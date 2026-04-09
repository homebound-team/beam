import React from "react";
import { Temporal } from "temporal-polyfill";

export type PlainDate = Temporal.PlainDate;

export type DateRange = {
  from: PlainDate | undefined;
  to?: PlainDate | undefined;
};

export type DayMatcher = (date: PlainDate) => boolean;

export type HasIdIsh<V = string> = { id: V } | { code: V };
export type HasNameIsh = { name: string } | { displayName: string } | { label: string };
export type HasIdAndName<V = string> = { id: V; name: string };

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export type CheckFn = () => boolean;
export type CanCloseCheck = { check: CheckFn; discardText?: string; continueText?: string } | CheckFn;
export function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}
export type AnyObject = Record<string, unknown>;
export type ChildrenOnly = { children: React.ReactNode };
