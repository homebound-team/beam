import { ObjectConfig, ObjectState, required, useFormState } from "@homebound/form-state";
import { reaction } from "mobx";
import { Observer } from "mobx-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, GridColumn, GridTable, IconButton, simpleHeader, SimpleHeaderAndData } from "src/components";
import { Step, Stepper } from "src/components/Stepper";
import { Css } from "src/Css";
import { BoundDateField } from "src/forms/BoundDateField";
import { BoundNumberField } from "src/forms/BoundNumberField";
import { BoundTextField } from "src/forms/BoundTextField";
import { AuthorInput } from "src/forms/formStateDomain";
import { useComputed } from "src/hooks";

export function StepperFormApp() {
  const formState = useFormState({
    config: formConfig,
    init: { input: {} as AuthorInput, map: (i) => i },
    addRules(state) {
      state.lastName.rules.push(() => {
        return state.firstName.value === state.lastName.value ? "Last name cannot equal first name" : undefined;
      });
    },
  });
  return <StepperForm formState={formState} />;
}

function StepperForm({ formState }: { formState: FormValue }) {
  const [steps, setSteps] = useState<Step[]>(() => [
    { state: "incomplete", label: "Author Details", value: "author" },
    { state: "incomplete", label: "Books", disabled: true, value: "books" },
    { state: "incomplete", label: "Miscellaneous Author Information", value: "misc", disabled: true },
  ]);

  const [currentStep, setActiveStep] = useState(steps[0].value);

  const setStep = useCallback(
    (stepValue: string, stepData: Partial<Step>) =>
      setSteps(steps.map((s) => (s.value === stepValue ? { ...s, ...stepData } : s))),
    [steps],
  );

  const onNext = useCallback(() => {
    // If we can proceed to the next step, then we should consider this step complete.
    setStep(currentStep, { state: "complete" });
    const currentStepIndex = steps.findIndex((s) => s.value === currentStep);
    if (currentStepIndex !== undefined) {
      setActiveStep(steps[currentStepIndex + 1].value);
    }
  }, [steps, currentStep, setStep]);

  const onBack = useCallback(() => {
    const currentStepIndex = steps.findIndex((s) => s.value === currentStep);
    setActiveStep(steps[currentStepIndex === 0 ? 0 : currentStepIndex - 1].value);
  }, [currentStep, steps]);

  useEffect(() => {
    const disposer = reaction(
      () => [formState.firstName.valid && formState.lastName.valid, formState.books.valid, formState.birthday.valid],
      ([step1Valid, step2Valid, step3Valid], [wasStep1Valid, wasStep2Valid, wasStep3Valid]) => {
        if (step1Valid && step1Valid !== wasStep1Valid) {
          setStep("books", { disabled: !step1Valid });
          return;
        }

        if (step2Valid && step2Valid !== wasStep2Valid) {
          setStep("misc", { disabled: !step2Valid });
          return;
        }

        if (step3Valid && step3Valid !== wasStep3Valid) {
          setStep("misc", { state: "complete" });
          return;
        }
      },
    );
    // Return the disposer in order to clean up useEffect.
    return disposer;
  }, [setStep, formState.birthday.valid, formState.books.valid, formState.firstName.valid, formState.lastName.valid]);

  return (
    <div>
      <Stepper steps={steps} currentStep={currentStep} onChange={setActiveStep} />

      <div css={Css.mt2.$}>
        {currentStep === "author" && <AuthorDetails formState={formState} onNext={onNext} />}
        {currentStep === "books" && <BookList formState={formState} onNext={onNext} onBack={onBack} />}
        {currentStep === "misc" && <MiscAuthorDetails formState={formState} onBack={onBack} />}
      </div>
    </div>
  );
}

function AuthorDetails({ formState, onNext }: { formState: FormValue; onNext: VoidFunction }) {
  return (
    <Observer>
      {() => (
        <div>
          <h1 css={Css.mb1.$}>Author Details</h1>
          <div css={Css.mb2.$}>
            <BoundTextField field={formState.firstName} helperText="Required to enable next step" />
          </div>
          <div css={Css.mb2.$}>
            <BoundTextField field={formState.lastName} helperText="Required to enable next step" />
          </div>

          <div css={Css.df.jcfe.bt.bGray300.py1.mt2.$}>
            <Button
              label="Continue to Books"
              disabled={!formState.firstName.valid || !formState.lastName.valid}
              onClick={onNext}
            />
          </div>
        </div>
      )}
    </Observer>
  );
}

function BookList({ formState, onNext, onBack }: { formState: FormValue; onNext: VoidFunction; onBack: VoidFunction }) {
  const columns = useMemo(() => createColumns(formState), [formState]);
  const rows = useComputed(
    () => [simpleHeader, ...formState.books.rows.map((data) => ({ kind: "data" as const, id: data.id.value!, data }))],
    [],
  );

  return (
    <div>
      <h1 css={Css.df.aic.$}>
        Books
        <IconButton
          icon="plus"
          onClick={() => formState.books.add({ id: String(formState.books.value?.length || 1) })}
        />
      </h1>
      <GridTable<Row> columns={columns} rows={rows} />

      <div css={Css.df.jcsb.bt.bGray300.py1.mt2.$}>
        <Button variant="tertiary" label="Back" onClick={onBack} />
        <Button label="Continue to Misc." disabled={!formState.books.valid} onClick={onNext} />
      </div>
    </div>
  );
}

type Row = SimpleHeaderAndData<FormValue["books"]["rows"][number]>;

function createColumns(formState: FormValue): GridColumn<Row>[] {
  return [
    { header: "#", data: ({ id }) => <span>{id.value}</span> },
    {
      header: "Title",
      data: ({ title }) => <BoundTextField label="" compact field={title} />,
    },
    {
      header: "Actions",
      data: (row) => <IconButton icon="x" onClick={() => formState.books.remove(row.value)} />,
    },
  ];
}

function MiscAuthorDetails({ formState, onBack }: { formState: FormValue; onBack: VoidFunction }) {
  const [showFormData, setShowFormData] = useState(false);
  return (
    <Observer>
      {() => (
        <div>
          <h1 css={Css.mb1.$}>Author Details</h1>
          <div css={Css.mb2.$}>
            <BoundDateField field={formState.birthday} helperText="Required" />
          </div>
          <div css={Css.mb2.$}>
            <BoundNumberField field={formState.heightInInches} />
          </div>

          <div css={Css.df.jcsb.bt.bGray300.py1.mt2.$}>
            <Button variant="tertiary" label="Back" onClick={onBack} />
            <Button
              disabled={!formState.valid}
              onClick={() => {
                if (formState.canSave()) {
                  formState.commitChanges();
                  setShowFormData(true);
                }
              }}
              label="Save"
            />
          </div>
          {showFormData && (
            <div css={Css.mt5.$}>
              <h2>Form saved!</h2>
              <ul>
                <li>
                  <strong>First Name</strong> {formState.value.firstName}
                </li>
                <li>
                  <strong>Last Name</strong> {formState.value.lastName}
                </li>
                <li>
                  <strong>Books</strong> {formState.value.books?.map((b) => b.title).join(", ")}
                </li>
                <li>
                  <strong>Birthday</strong> {formState.value.birthday?.toDateString()}
                </li>
                <li>
                  <strong>Height</strong> {formState.value.heightInInches}
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </Observer>
  );
}

type FormValue = ObjectState<AuthorInput>;

// Configure the fields/behavior for AuthorInput's fields
const formConfig: ObjectConfig<AuthorInput> = {
  firstName: { type: "value", rules: [required] },
  lastName: { type: "value", rules: [required] },
  birthday: { type: "value", rules: [required] },
  heightInInches: { type: "value" },
  books: {
    type: "list",
    rules: [({ value }) => ((value || []).length === 0 ? "Empty" : undefined)],
    config: {
      id: { type: "value" },
      title: { type: "value", rules: [required] },
    },
  },
};
