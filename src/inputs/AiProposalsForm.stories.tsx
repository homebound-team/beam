import { ObjectConfig, ObjectState, required, useFormState } from "@homebound/form-state";
import { Meta } from "@storybook/react-vite";
import { Observer } from "mobx-react";
import { useState } from "react";
import { Button } from "src/components";
import { Css, Palette } from "src/Css";
import { FormLines } from "src/forms";
import { BoundDateField } from "src/forms/BoundDateField";
import { BoundMultiSelectField } from "src/forms/BoundMultiSelectField";
import { BoundNumberField } from "src/forms/BoundNumberField";
import { BoundSelectField } from "src/forms/BoundSelectField";
import { BoundTextAreaField } from "src/forms/BoundTextAreaField";
import { BoundTextField } from "src/forms/BoundTextField";
import { DateRange, HasIdAndName, PlainDate } from "src/types";
import { withBeamDecorator } from "src/utils/sb";
import { jan2, jan29 } from "src/utils/testDates";

export default {
  title: "Inputs/AI Proposals Form",
  decorators: [withBeamDecorator],
} as Meta;

/** The on-the-wire type we'd actually save. */
type PlanInput = {
  name?: string | null;
  stories?: number | null;
  ceilingHeight?: number | null;
  primaryBedroomLocation?: string | null;
  bedroomLocations?: string[] | null;
  startDate?: PlainDate | null;
  notes?: string | null;
  disabledState?: string | null;
};

const formConfig: ObjectConfig<PlanInput> = {
  name: { type: "value", rules: [required] },
  stories: { type: "value" },
  ceilingHeight: { type: "value" },
  primaryBedroomLocation: { type: "value" },
  bedroomLocations: { type: "value" },
  startDate: { type: "value" },
  notes: { type: "value" },
  disabledState: { type: "value" },
};

const locations: HasIdAndName[] = [
  { id: "up", name: "Up" },
  { id: "down", name: "Down" },
  { id: "sideways", name: "Sideways" },
];

/** What the AI extracted from the doc, i.e. what a caller would pass as `proposedValue`. */
const proposals = {
  name: "Janes Cottage",
  stories: 3,
  ceilingHeight: 25,
  primaryBedroomLocation: "down",
  // Overlaps the two already on record, so only "Sideways" is genuinely new.
  bedroomLocations: ["up", "down", "sideways"],
  startDate: jan29,
  notes: "Framing inspection passed on 1/19.",
  disabledState: "AI-locked value",
};

/** What's already on record, i.e. the form's `init` and each field's struck-through original. */
const onRecord: PlanInput = {
  name: "Old Cottage",
  stories: 2,
  ceilingHeight: 20,
  primaryBedroomLocation: "up",
  bedroomLocations: ["up", "down"],
  startDate: jan2,
  notes: "Old note about the framing.",
  disabledState: "Locked value",
};

/**
 * The same input plus an `id`, matching how we set up auto-saving forms in `internal-frontend`. A
 * field named `id` defaults to `isIdKey: true`, so it's always included in `changedValue` and the
 * mutation knows which record it's patching.
 */
type SavedPlanInput = PlanInput & { id?: string | null };

const autoSaveConfig: ObjectConfig<SavedPlanInput> = { id: { type: "value" }, ...formConfig };

type Submission = { changedValue: unknown; input: unknown };

const disabledReason = "This field is disabled because it's an AI-controlled field, intentionally";

/**
 * The caller's half of the contract: send the proposal for any field the user never took over, and
 * whatever they chose for the ones they did.
 *
 * `changedValue` alone can't do this. Rejecting a proposal by re-entering the on-record value isn't a
 * change, so it never lands in `changedValue` — indistinguishable from a field nobody looked at, even
 * though one must save the user's value and the other the proposal. The `edited` set is the missing
 * bit, and the field's `onChange` is where it comes from.
 */
function buildSaveInput(formState: ObjectState<PlanInput>, edited: Set<string>) {
  const input: Record<string, unknown> = { ...formState.changedValue };
  for (const [key, proposal] of Object.entries(proposals)) {
    if (!edited.has(key)) input[key] = proposal;
  }
  return input;
}

/**
 * A real `useFormState` form wired to `Bound*` fields, so you can see exactly which values a save
 * would send.
 *
 * `proposedValue` is presentational: form state keeps the on-record value until the user edits, so
 * `changedValue` alone would drop every proposal the user agreed with. Save fills those in, while
 * tracking which fields the user took over so their choices aren't overwritten — including a
 * rejection back to the on-record value, which `changedValue` can't see. Try it on Stories: it starts
 * 2 with 3 proposed, and typing 2 back should save 2, not 3.
 */
export function BoundFormWithProposals() {
  // Remount to start over: `revertChanges()` alone puts the values back but does *not* bring the AI
  // treatment back, because a reviewed proposal stays reviewed (see `useAiProposal`).
  const [attempt, setAttempt] = useState(0);
  return <PlanForm key={attempt} onStartOver={() => setAttempt((a) => a + 1)} />;
}

function PlanForm({ onStartOver }: { onStartOver: VoidFunction }) {
  const formState = useFormState({ config: formConfig, init: { input: onRecord } });
  const [submitted, setSubmitted] = useState<Submission | undefined>();
  // Fields the user has taken over, which form state can't tell us. Populated from each field's
  // `onChange` — the one moment the intent is observable.
  const [edited] = useState(() => new Set<string>());
  const takeOver = (key: keyof PlanInput) => (value: any) => {
    edited.add(key);
    (formState[key] as any).set(value);
  };

  return (
    <div css={Css.df.gap4.aifs.$}>
      <div css={Css.fg1.maxwPx(460).$}>
        <h1 css={Css.lg.mb2.$}>Plan details</h1>
        <FormLines width="full">
          <BoundTextField field={formState.name} proposedValue={proposals.name} onChange={takeOver("name")} />
          <BoundNumberField
            field={formState.stories}
            proposedValue={proposals.stories}
            onChange={takeOver("stories")}
          />
          <BoundNumberField
            field={formState.ceilingHeight}
            proposedValue={proposals.ceilingHeight}
            onChange={takeOver("ceilingHeight")}
          />
          <BoundSelectField
            field={formState.primaryBedroomLocation}
            proposedValue={proposals.primaryBedroomLocation}
            options={locations}
            onSelect={takeOver("primaryBedroomLocation")}
          />
          <BoundMultiSelectField
            field={formState.bedroomLocations}
            proposedValues={proposals.bedroomLocations}
            options={locations}
            onSelect={takeOver("bedroomLocations")}
          />
          <BoundDateField
            field={formState.startDate}
            proposedValue={proposals.startDate}
            onChange={takeOver("startDate")}
          />
          <BoundTextAreaField field={formState.notes} proposedValue={proposals.notes} onChange={takeOver("notes")} />
          <BoundTextField
            field={formState.disabledState}
            proposedValue={proposals.disabledState}
            disabled={disabledReason}
          />
        </FormLines>

        <div css={Css.df.gap1.mt3.$}>
          <Observer>
            {() => (
              <Button
                label="Save"
                onClick={() =>
                  setSubmitted({ changedValue: formState.changedValue, input: buildSaveInput(formState, edited) })
                }
                disabled={!formState.valid && "Fix the form's errors first"}
              />
            )}
          </Observer>
          <Button
            label="Start over"
            variant="tertiary"
            onClick={() => {
              setSubmitted(undefined);
              onStartOver();
            }}
          />
        </div>
      </div>

      <div css={Css.fg1.maxwPx(460).$}>
        <h1 css={Css.lg.mb2.$}>Save payload</h1>
        <Observer>{() => <FieldStatus rows={fieldStatusRows(formState)} />}</Observer>
        {submitted ? (
          <>
            <Panel
              title="changedValue — only what the user edited"
              body={submitted.changedValue}
              emptyNote="The user edited nothing, so this is empty."
            />
            <Panel
              title="input — what Save sends (proposals, minus fields the user took over)"
              body={submitted.input}
            />
          </>
        ) : (
          <p css={Css.sm.gray700.$}>Hit Save to capture what would be sent.</p>
        )}
      </div>
    </div>
  );
}

/**
 * The same form, but auto-saving on blur the way our pages actually do it — no Submit button.
 *
 * This is the shape used throughout `internal-frontend` (44 of its ~54 auto-saving forms):
 *
 * ```ts
 * const formState = useFormState({
 *   config,
 *   init: { input, map },
 *   autoSave: async (state) => saveThing({ variables: { input: state.changedValue } }),
 * });
 * ```
 *
 * The thing to watch is what does *not* happen: tabbing through every field saves nothing. Auto-save
 * is gated on `form.dirty` inside `useFormState`, and an AI proposal doesn't dirty anything until the
 * user actually edits — so reviewing a proposed form never silently commits it. Edit one field and
 * only that field (plus the `id`) goes over the wire.
 *
 * Which also means: with no Save button to merge the proposals into, a proposal the user agrees with
 * never reaches the server at all. Auto-save and "accepted unless changed" are in tension.
 *
 * Note the `savedRecord` round-trip below. Real pages get this from Apollo for free (the mutation
 * updates the cache, the query re-renders, `init.input` changes), and it's load-bearing: it's what
 * un-dirties the form. A fake `autoSave` that only logs leaves the form permanently dirty, so every
 * subsequent blur re-fires the same save.
 */
export function AutoSaveWithProposals() {
  const [attempt, setAttempt] = useState(0);
  return <AutoSavePlanForm key={attempt} onStartOver={() => setAttempt((a) => a + 1)} />;
}

function AutoSavePlanForm({ onStartOver }: { onStartOver: VoidFunction }) {
  const [saves, setSaves] = useState<string[]>([]);
  // Stands in for the server record / Apollo cache. Feeding this back in as `init.input` is what
  // un-dirties the form after a save — see the note on `autoSave` below.
  const [savedRecord, setSavedRecord] = useState<SavedPlanInput>({ id: "rp:1", ...onRecord });

  const formState = useFormState({
    config: autoSaveConfig,
    init: { input: savedRecord },
    autoSave: async (state) => {
      // Snapshot `changedValue` synchronously, before awaiting — the same moment a real caller reads
      // it when building `variables`.
      const payload = state.changedValue;
      const json = JSON.stringify(payload, jsonReplacer, 2);
      await fakeNetworkLatency();
      // Write the result back into `init.input`, standing in for the mutation response landing in the
      // Apollo cache. form-state does NOT clear dirty on its own (it even makes `commitChanges` throw
      // while auto-saving) — it re-inits from `init` and un-dirties whatever now matches the server.
      // Without this, the form stays dirty and every later blur re-fires the same save.
      setSavedRecord((prev) => ({ ...prev, ...payload }));
      setSaves((prev) => [...prev, json]);
    },
  });

  return (
    <div css={Css.df.gap4.aifs.$}>
      <div css={Css.fg1.maxwPx(460).$}>
        <h1 css={Css.lg.mb2.$}>Plan details</h1>
        <p css={Css.sm.gray700.mb2.$}>Saves on blur. Tab through without editing and nothing is sent.</p>
        <FormLines width="full">
          <BoundTextField field={formState.name} proposedValue={proposals.name} />
          <BoundNumberField field={formState.stories} proposedValue={proposals.stories} />
          <BoundNumberField field={formState.ceilingHeight} proposedValue={proposals.ceilingHeight} />
          <BoundSelectField
            field={formState.primaryBedroomLocation}
            proposedValue={proposals.primaryBedroomLocation}
            options={locations}
          />
          <BoundMultiSelectField
            field={formState.bedroomLocations}
            proposedValues={proposals.bedroomLocations}
            options={locations}
          />
          <BoundDateField field={formState.startDate} proposedValue={proposals.startDate} />
          <BoundTextAreaField field={formState.notes} proposedValue={proposals.notes} />
          <BoundTextField
            field={formState.disabledState}
            proposedValue={proposals.disabledState}
            disabled={disabledReason}
          />
        </FormLines>

        <div css={Css.df.gap1.mt3.$}>
          <Button label="Start over" variant="tertiary" onClick={onStartOver} />
        </div>
      </div>

      <div css={Css.fg1.maxwPx(460).$}>
        <h1 css={Css.lg.mb2.$}>Auto-save log</h1>
        <Observer>{() => <FieldStatus rows={fieldStatusRows(formState)} />}</Observer>
        {saves.length === 0 ? (
          <p css={Css.sm.gray700.$}>No saves yet — the form isn't dirty, so `autoSave` hasn't fired.</p>
        ) : (
          saves.map((payload, i) => <Panel key={i} title={`Save #${i + 1} — changedValue`} rawBody={payload} />)
        )}
      </div>
    </div>
  );
}

/** Stands in for a mutation round-trip, so "Saving…" is observable rather than instant. */
function fakeNetworkLatency() {
  return new Promise((resolve) => setTimeout(resolve, 400));
}

/**
 * Live per-field readout, so it's obvious which fields are still showing a proposal.
 *
 * Reads the observables via `fieldStatusRows` inside an `<Observer>` rather than in here — a plain
 * component's mobx reads aren't tracked by a wrapping Observer, so the table would go stale.
 */
function FieldStatus({ rows }: { rows: { key: string; dirty: boolean; committed: boolean }[] }) {
  return (
    <table css={Css.w100.sm.mb3.$}>
      <thead>
        <tr css={Css.tal.gray700.$}>
          <th css={Css.pb1.$}>Field</th>
          <th css={Css.pb1.$}>Pending save?</th>
          <th css={Css.pb1.$}>Showing proposal?</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ key, dirty, committed }) => (
          <tr key={key}>
            <td css={Css.pyPx(2).$}>{key}</td>
            <td css={Css.pyPx(2).$}>{dirty ? "yes" : "no"}</td>
            <td css={Css.pyPx(2).color(committed ? Palette.Gray700 : Palette.Purple800).$}>
              {committed ? "no — committed" : "yes"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Snapshots each field's status. Call this inside an `<Observer>` so the reads are tracked.
 *
 * `dirty` means "has an un-saved edit" — auto-save clears it on the refresh after a save. Whether the
 * field still shows its proposal is a different question, so we answer it the way `useAiProposal`
 * does: by comparing against the value that was on record when the form loaded.
 */
function fieldStatusRows(formState: ObjectState<PlanInput> | ObjectState<SavedPlanInput>) {
  // Driven off `formConfig`, so the auto-save form's extra `id` field is left out of the readout.
  return (Object.keys(formConfig) as (keyof PlanInput)[]).map((key) => {
    const field = formState[key] as { dirty: boolean; value: unknown };
    return {
      key: String(key),
      dirty: field.dirty,
      committed: !sameish(field.value, onRecord[key]),
    };
  });
}

/** Loose value compare that copes with arrays and `PlainDate` (which serializes via `toJSON`). */
function sameish(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

/** Renders a payload, either a live object (`body`) or an already-captured snapshot (`rawBody`). */
function Panel({
  title,
  body,
  rawBody,
  emptyNote,
}: {
  title: string;
  body?: unknown;
  rawBody?: string;
  emptyNote?: string;
}) {
  const json = rawBody ?? JSON.stringify(body, jsonReplacer, 2);
  const isEmpty = json === undefined || json === "{}";
  return (
    <div css={Css.mb3.$}>
      <h2 css={Css.smSb.mb1.$}>{title}</h2>
      {isEmpty && emptyNote && <p css={Css.xs.gray700.mb1.$}>{emptyNote}</p>}
      <pre css={Css.xs.bgGray100.br4.p2.oa.$}>{json}</pre>
    </div>
  );
}

/** `PlainDate`/`DateRange` don't stringify usefully on their own. */
function jsonReplacer(_key: string, value: unknown) {
  if (value && typeof value === "object" && "toString" in value && value.constructor?.name === "PlainDate") {
    return String(value);
  }
  return value as DateRange | undefined;
}
