import { MutableRefObject } from "react";
import type { CheckboxGroupState, ToggleState } from "react-stately";

export function fail(message?: string): never {
  throw new Error(message || "Failed");
}

/** Adapts our state to what useToggleState returns in a stateless manner. */
export function toToggleState(isSelected: boolean, onChange: (value: boolean) => void): ToggleState {
  return {
    isSelected,
    setSelected: onChange,
    toggle: () => onChange(!isSelected),
  };
}

/** Adapts our state to what use*Group returns in a stateless manner. */
export function toGroupState<T extends string>(values: T[], onChange: (value: T[]) => void): CheckboxGroupState {
  const addValue = (value: T) => onChange([...values, value]);
  const removeValue = (value: T) => onChange(values.filter((_value) => _value !== value));

  return {
    value: values,
    setValue: onChange,
    isSelected: (value: T) => values.includes(value),
    addValue,
    removeValue,
    toggleValue: (value: T) => (values.includes(value) ? addValue(value) : removeValue(value)),
    isDisabled: false,
    isReadOnly: false,
    // We do not use the validation state, as our Switch groups do not support error states. However, this field is required by the `CheckboxGroupState` so we need to include it.
    // If we ever update our SwitchGroup component to support error states, we'll need to update this.
    validationState: "valid",
  };
}

/**
 * Utility to maybe call a function if undefined with arguments
 *
 * @example
 *  maybeCall(onChange, true)
 *  maybeCall(onBlur)
 *  maybeCall(onSelect, { id: 1, value: "book 1"}, true)
 */
export function maybeCall(callback: Function | undefined, ...args: any[]) {
  return callback && callback(...args);
}

export * from "./useTestIds";

/** Casts `Object.keys` to "what it should be", as long as your instance doesn't have keys it shouldn't. */
export function safeKeys<T>(instance: T): (keyof T)[] {
  return Object.getOwnPropertyNames(instance) as any;
}

// Returns object with specified key removed
export const omitKey = <T, K extends keyof T>(key: K, { [key]: _, ...obj }: T) => obj as T;

export const noop = (..._: any) => {};

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export function safeEntries<T extends object>(obj: T): Entries<T> {
  return Object.entries(obj) as any;
}

export class EmptyRef<T> implements MutableRefObject<T> {
  get current(): T {
    throw new Error("BeamProvider is missing");
  }

  set current(_) {
    throw new Error("BeamProvider is missing");
  }
}

export const isAbsoluteUrl = (url: string) => /^(http(s?)):\/\//i.test(url);

export function areArraysEqual(a: any[], b: any[]): boolean {
  return a.length === b.length && a.every((val, idx) => val === b[idx]);
}

export function isPromise(obj: any | Promise<any>): obj is Promise<any> {
  return typeof obj === "object" && "then" in obj && typeof obj.then === "function";
}

export function isFunction(f: any): f is Function {
  return typeof f === "function";
}

export function isDefined<T extends any>(param: T | undefined | null): param is T {
  return param !== null && param !== undefined;
}

export function pluralize(count: number | unknown[], noun: string, pluralNoun?: string): string {
  if ((Array.isArray(count) ? count.length : count) === 1) return noun;
  return pluralNoun || `${noun}s`;
}
