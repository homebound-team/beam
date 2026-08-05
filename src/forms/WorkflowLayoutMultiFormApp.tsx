import { ObjectConfig, ObjectState, required, useFormState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { useCallback, useEffect, useState } from "react";
import { Css, Tokens } from "src/Css";
import { BoundTextField } from "src/forms/BoundTextField";
import { FormSectionLayout, WorkflowLayout, WorkflowLayoutStep } from "src/layouts";

type ProjectBasics = { name?: string | null; code?: string | null };
type ProjectContact = { email?: string | null; phone?: string | null };
type ProjectNotes = { summary?: string | null };

/**
 * Demos `WorkflowLayout` when each step owns its own form-state: keep forms alive at the page,
 * load step data on demand via `init` (so hydration is not dirty), and OR their `.dirty` flags
 * into `isDirty`.
 */
export function WorkflowLayoutMultiFormApp() {
  // Keep form states mounted for the whole workflow so leave-guards can see every step's dirty flag.
  // Start with config only — light until each step's data is fetched into `init`.
  const [basicsInput, setBasicsInput] = useState<ProjectBasics | undefined>();
  const [contactInput, setContactInput] = useState<ProjectContact | undefined>();
  const [notesInput, setNotesInput] = useState<ProjectNotes | undefined>();

  const loadBasics = useCallback(() => setBasicsInput({ name: "", code: "" }), []);
  const loadContact = useCallback(() => setContactInput({ email: "", phone: "" }), []);
  const loadNotes = useCallback(() => setNotesInput({ summary: "" }), []);

  const basicsForm = useFormState({
    config: basicsConfig,
    ...(basicsInput ? { init: { input: basicsInput, map: (i: ProjectBasics) => i } } : {}),
  });
  const contactForm = useFormState({
    config: contactConfig,
    ...(contactInput ? { init: { input: contactInput, map: (i: ProjectContact) => i } } : {}),
  });
  const notesForm = useFormState({
    config: notesConfig,
    ...(notesInput ? { init: { input: notesInput, map: (i: ProjectNotes) => i } } : {}),
  });

  return (
    <Observer>
      {() => {
        const steps: WorkflowLayoutStep[] = [
          {
            label: "Basics",
            completed: basicsForm.valid,
            content: <BasicsStep form={basicsForm} onLoad={loadBasics} loaded={!!basicsInput} />,
          },
          {
            label: "Contact",
            completed: contactForm.valid,
            disabled: !basicsForm.valid,
            content: <ContactStep form={contactForm} onLoad={loadContact} loaded={!!contactInput} />,
          },
          {
            label: "Notes",
            completed: notesForm.valid,
            disabled: !contactForm.valid,
            content: <NotesStep form={notesForm} onLoad={loadNotes} loaded={!!notesInput} />,
          },
        ];

        return (
          <WorkflowLayout
            title="Multi-form Workflow"
            onCancel={() => {}}
            completeLabel="Create"
            onComplete={() => {
              basicsForm.commitChanges();
              contactForm.commitChanges();
              notesForm.commitChanges();
            }}
            isDirty={() => basicsForm.dirty || contactForm.dirty || notesForm.dirty}
            steps={steps}
          />
        );
      }}
    </Observer>
  );
}

function BasicsStep(props: { form: ObjectState<ProjectBasics>; onLoad: () => void; loaded: boolean }) {
  const { form, onLoad, loaded } = props;
  useLoadStepData(loaded, onLoad);

  return (
    <FormSectionLayout
      title="Project basics"
      description="Each step has its own form-state, kept alive on the workflow page. Data is loaded when you open the step."
      sections={[
        {
          title: "Identity",
          fields: (
            <>
              <div css={Css.mb2.$}>
                <BoundTextField field={form.name} />
              </div>
              <div css={Css.mb2.$}>
                <BoundTextField field={form.code} />
              </div>
              <DirtyHint form={form} />
            </>
          ),
        },
      ]}
    />
  );
}

function ContactStep(props: { form: ObjectState<ProjectContact>; onLoad: () => void; loaded: boolean }) {
  const { form, onLoad, loaded } = props;
  useLoadStepData(loaded, onLoad);

  return (
    <FormSectionLayout
      title="Contact"
      sections={[
        {
          title: "Reachability",
          fields: (
            <>
              <div css={Css.mb2.$}>
                <BoundTextField field={form.email} />
              </div>
              <div css={Css.mb2.$}>
                <BoundTextField field={form.phone} />
              </div>
              <DirtyHint form={form} />
            </>
          ),
        },
      ]}
    />
  );
}

function NotesStep(props: { form: ObjectState<ProjectNotes>; onLoad: () => void; loaded: boolean }) {
  const { form, onLoad, loaded } = props;
  useLoadStepData(loaded, onLoad);

  return (
    <FormSectionLayout
      title="Notes"
      sections={[
        {
          title: "Summary",
          fields: (
            <>
              <div css={Css.mb2.$}>
                <BoundTextField field={form.summary} />
              </div>
              <DirtyHint form={form} />
            </>
          ),
        },
      ]}
    />
  );
}

function DirtyHint({ form }: { form: { dirty: boolean } }) {
  return (
    <Observer>
      {() => (
        <p css={Css.sm.color(Tokens.OnSurface).$}>
          This step is {form.dirty ? "dirty" : "clean"}. Cancel / route leave / tab close use the OR of every step's
          dirty flag.
        </p>
      )}
    </Observer>
  );
}

/** Simulates fetching step data the first time the step mounts; parent feeds it into `useFormState` `init`. */
function useLoadStepData(loaded: boolean, onLoad: () => void) {
  useEffect(() => {
    if (!loaded) onLoad();
  }, [loaded, onLoad]);
}

const basicsConfig: ObjectConfig<ProjectBasics> = {
  name: { type: "value", rules: [required] },
  code: { type: "value", rules: [required] },
};

const contactConfig: ObjectConfig<ProjectContact> = {
  email: { type: "value", rules: [required] },
  phone: { type: "value" },
};

const notesConfig: ObjectConfig<ProjectNotes> = {
  summary: { type: "value", rules: [required] },
};
