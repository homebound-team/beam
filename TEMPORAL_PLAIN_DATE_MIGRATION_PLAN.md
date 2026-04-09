# Temporal PlainDate migration plan

## Goal

Migrate Beam's date-only components and related APIs from raw JS `Date` to `Temporal.PlainDate` using `temporal-polyfill`, with the public API cut over fully to `PlainDate`.

This includes:

- `DateField`
- `DateRangeField`
- internal `DatePicker` / `DateRangePicker`
- bound form wrappers
- date filters
- exported Beam date types
- disabled/dotted matcher APIs
- persisted query-param / session-storage filter values

## Polyfill choice

Use:

```ts
import { Temporal } from "temporal-polyfill";
```

Do **not** use `temporal-polyfill/global`, because Beam is a library and should avoid mutating globals.

## Desired public API

Beam should expose only `Temporal.PlainDate`-based date types.

### Exported types

In `src/types.ts`:

- export `type PlainDate = Temporal.PlainDate`
- replace the current `react-day-picker` `DateRange` re-export with a Beam-owned range type
- add Beam-owned matcher types for disabled/dotted day APIs

Suggested shapes:

```ts
export type PlainDate = Temporal.PlainDate;

export type DateRange = {
  from: PlainDate | undefined;
  to?: PlainDate | undefined;
};

export type DateBefore = { before: PlainDate };
export type DateAfter = { after: PlainDate };
export type DateInterval = { before: PlainDate; after: PlainDate };
export type DayOfWeek = { dayOfWeek: number[] };

export type DateMatcher =
  | boolean
  | PlainDate
  | PlainDate[]
  | DateRange
  | DateBefore
  | DateAfter
  | DateInterval
  | DayOfWeek
  | ((date: PlainDate) => boolean);
```

Beam should no longer publicly expose `react-day-picker`'s `DateRange` or `Matcher` types.

## Migration strategy

### 1. Add core Temporal helpers

Create a small internal adapter module for all `PlainDate <-> Date` interop.

Responsibilities:

- convert `PlainDate` to JS `Date` for `react-day-picker`
- convert JS `Date` back to `PlainDate`
- convert Beam `DateRange` to `react-day-picker` ranges and back
- convert Beam `DateMatcher` values to `react-day-picker` matchers
- provide helpers for `today`

Recommended helpers:

- `plainDateToJsDate(date: PlainDate): Date`
- `jsDateToPlainDate(date: Date): PlainDate`
- `dateRangeToJsDateRange(range: DateRange | undefined)`
- `jsDateRangeToDateRange(range: react-day-picker range | undefined)`
- `dateMatcherToDayPickerMatcher(matcher: DateMatcher)`
- `dateMatchersToDayPickerMatchers(matchers: DateMatcher | DateMatcher[] | undefined)`
- `todayPlainDate(): PlainDate`

Implementation note:

- use a stable local-time conversion when creating JS `Date` instances for UI interop to avoid timezone / DST drift

### 2. Replace exported Beam date types

Update:

- `src/types.ts`
- `src/index.ts`

Changes:

- remove the `react-day-picker` `DateRange` re-export
- export Beam-owned `PlainDate`, `DateRange`, and matcher types

### 3. Migrate date formatting / parsing utilities

Update `src/inputs/DateFields/utils.ts`.

Changes:

- replace `Date`-based types with `PlainDate`
- keep date-fns formatting/parsing only at the interop boundary
- convert parsed JS `Date` results into `PlainDate`
- update validation helpers to validate `PlainDate`

Target behavior remains the same:

- support current short/medium/long display formats
- preserve current input parsing behavior for `MM/dd/yy`
- preserve range correction when `to < from`

### 4. Migrate field components to `PlainDate`

Update:

- `src/inputs/DateFields/DateFieldBase.tsx`
- `src/inputs/DateFields/DateField.tsx`
- `src/inputs/DateFields/DateRangeField.tsx`
- `src/inputs/DateFields/index.ts`
- `src/inputs/DateFields/DateField.mock.tsx`

Changes:

- `value` and `onChange` use `PlainDate`
- range values use Beam `DateRange`
- `disabledDays` uses Beam `DateMatcher | DateMatcher[]`
- remove remaining raw `Date`-based unions from the public field APIs
- keep the current UX for focus/blur/manual typing/calendar selection

### 5. Migrate internal date pickers while keeping `Date` internal only

Update:

- `src/components/internal/DatePicker/DatePicker.tsx`
- `src/components/internal/DatePicker/DateRangePicker.tsx`
- `src/components/internal/DatePicker/Header.tsx`
- `src/components/internal/DatePicker/WeekHeader.tsx`

Changes:

- `DatePickerProps.value?: PlainDate`
- `onSelect: (value: PlainDate) => void`
- `DateRangePickerProps.range: DateRange | undefined`
- `onSelect: (range: DateRange | undefined) => void`
- `disabledDays` / `dottedDays` use Beam matcher types
- convert to JS `Date` only when rendering `react-day-picker`
- convert selected day/range values back into `PlainDate`
- replace `new Date()` defaults with `Temporal.Now.plainDateISO()` via helper

### 6. Migrate wrappers and filters

Update:

- `src/forms/BoundDateField.tsx`
- `src/forms/BoundDateRangeField.tsx`
- `src/forms/BoundForm.tsx`
- `src/components/ButtonDatePicker.tsx`
- `src/components/Filters/DateFilter.tsx`
- `src/components/Filters/DateRangeFilter.tsx`
- `src/components/Filters/index.ts`

Changes:

- bound field `FieldState`s switch to `PlainDate | null | undefined`
- date filter values switch to `PlainDate`
- date range filter values switch to Beam `DateRange`
- `ButtonDatePicker` becomes `PlainDate`-only
- filter components stop constructing dates with `new Date(...)`

## Persisted filter compatibility

### Problem

`usePersistedFilter` currently persists values via JSON/query params. After the migration, `Temporal.PlainDate` values will round-trip as strings, not `PlainDate` objects.

Without rehydration, restored filter state will contain strings instead of `PlainDate` values.

### Required support

Support both:

- new persisted values like `"2020-01-29"`
- old persisted values like ISO timestamps or prior `Date`-serialized strings

### Plan

Update:

- `src/components/Filters/types.ts`
- `src/hooks/usePersistedFilter.ts`
- `src/components/Filters/DateFilter.tsx`
- `src/components/Filters/DateRangeFilter.tsx`

Add per-filter hydrate/dehydrate support so date filters can restore persisted values as `PlainDate`.

Suggested direction:

- extend `Filter<V>` with optional serialization hooks
  - `hydrate?(value: unknown): V | undefined`
  - `dehydrate?(value: V | undefined): unknown`
- `DateFilter` hydrates:
  - `YYYY-MM-DD`
  - legacy timestamp-like strings by converting them to `PlainDate`
- `DateRangeFilter` hydrates:
  - `{ from: "YYYY-MM-DD", to: "YYYY-MM-DD" }`
  - legacy `{ from: <ISO timestamp>, to: <ISO timestamp> }`
- `usePersistedFilter` uses these hooks when restoring query/session values

This preserves old deep links and stored filters while standardizing newly persisted values around `PlainDate` strings.

## Example domain and story/test updates

Update sample dates in:

- `src/forms/formStateDomain.ts`

Changes:

- replace `new Date(...)` constants with `Temporal.PlainDate.from(...)`
- update sample input types like `birthday?: PlainDate | null`
- update `saleDates?: DateRange | null`

Update all affected stories/tests/examples that currently rely on:

- `new Date(...)`
- `.toDateString()`
- `Date`-typed state
- JSON output expectations containing ISO timestamp prefixes

Important areas:

- `src/inputs/DateFields/*.test.tsx`
- `src/inputs/DateFields/*.stories.tsx`
- `src/components/internal/DatePicker/*.stories.tsx`
- `src/components/ButtonDatePicker*.tsx`
- `src/components/Filters/*Date*.tsx`
- `src/forms/*Date*.tsx`
- `src/forms/StepperFormApp.tsx`
- `src/components/PresentationContext.stories.tsx`
- other story/test fixtures using Beam date fields

## Validation plan

### Targeted tests

Run targeted `vitest` first for date-related files, including:

- `src/inputs/DateFields/DateField.test.tsx`
- `src/inputs/DateFields/DateRangeField.test.tsx`
- `src/inputs/DateFields/DateFieldBase.test.tsx`
- `src/inputs/DateFields/DateField.mock.test.tsx`
- `src/forms/BoundDateField.test.tsx`
- `src/forms/BoundDateRangeField.test.tsx`
- `src/components/ButtonDatePicker.test.tsx`
- `src/components/Filters/DateFilter.test.tsx`
- `src/components/Filters/DateRangeFilter.test.tsx`
- `src/hooks/usePersistedFilter.test.tsx`

### Repo validation

Before finishing:

- lint changed files
- run relevant targeted tests
- run `yarn type-check`
- run broader `yarn test` if needed based on fallout

## Order of implementation

1. Add `temporal-polyfill`
2. Add Beam-owned Temporal types and internal date adapter helpers
3. Migrate `DateFields/utils.ts`
4. Migrate `DateFieldBase`, `DateField`, `DateRangeField`, and mocks
5. Migrate internal `DatePicker` / `DateRangePicker`
6. Migrate wrappers (`BoundDateField`, `BoundDateRangeField`, `ButtonDatePicker`)
7. Migrate `DateFilter` / `DateRangeFilter`
8. Add persisted filter hydration for new and old values
9. Update stories, tests, and sample domain data
10. Run lint, tests, and type-checking

## Risks / tricky areas

- matcher conversion must preserve existing `react-day-picker` behavior
- persisted filter hydration must not leak strings into runtime filter state
- date-only conversions must avoid timezone drift
- all user-facing date APIs must stop exposing raw `Date`
- story/test assertions that rely on ISO timestamps or `toDateString()` will need to be rewritten

## Definition of done

The migration is complete when:

- Beam public date APIs expose only `Temporal.PlainDate`-based types
- Beam no longer publicly exports `react-day-picker` date types
- `disabledDays` / `dottedDays` are `PlainDate`-based
- persisted filters restore both old `Date`-serialized values and new `PlainDate` values
- raw JS `Date` is used only inside internal interop layers
- all relevant tests, lint, and type-checking pass
