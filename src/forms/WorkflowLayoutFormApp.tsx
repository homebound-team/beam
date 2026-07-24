import { ObjectConfig, ObjectState, required, useFormState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { useMemo, useState } from "react";
import { GridColumn, GridDataRow, GridTable, IconButton, simpleHeader, SimpleHeaderAndData } from "src/components";
import { Css } from "src/Css";
import { BoundDateField } from "src/forms/BoundDateField";
import { BoundNumberField } from "src/forms/BoundNumberField";
import { BoundTextField } from "src/forms/BoundTextField";
import { AuthorInput } from "src/forms/formStateDomain";
import { useComputed } from "src/hooks";
import { WorkflowLayout, WorkflowLayoutStep } from "src/layouts";

/**
 * Demos `WorkflowLayout` over the same form-state domain as `StepperFormApp` — the header (title, tab
 * strip, Back/Cancel/Save CTAs) and the active step's content are both driven from the same `steps` array.
 */
export function WorkflowLayoutFormApp() {
  const formState = useFormState({
    config: formConfig,
    init: { input: {} as AuthorInput, map: (i) => i },
    addRules(state) {
      state.lastName.rules.push(() => {
        return state.firstName.value === state.lastName.value ? "Last name cannot equal first name" : undefined;
      });
    },
  });
  return <WorkflowLayoutForm formState={formState} />;
}

function WorkflowLayoutForm({ formState }: { formState: FormValue }) {
  const [currentStep, setCurrentStep] = useState("author");
  const [showFormData, setShowFormData] = useState(false);

  return (
    <Observer>
      {() => {
        const step1Valid = formState.firstName.valid && formState.lastName.valid;
        const step2Valid = formState.books.valid;

        const steps: WorkflowLayoutStep[] = [
          {
            label: "Author Details",
            value: "author",
            isValid: step1Valid,
            content: <AuthorDetails formState={formState} />,
          },
          {
            label: "Books",
            value: "books",
            isValid: step2Valid,
            disabled: !step1Valid,
            content: <BookList formState={formState} />,
          },
          {
            label: "Miscellaneous Author Information",
            value: "misc",
            isValid: formState.birthday.valid,
            disabled: !step2Valid,
            content: <MiscAuthorDetails formState={formState} showFormData={showFormData} />,
          },
        ];

        const onSave = () => {
          if (formState.canSave()) {
            formState.commitChanges();
            setShowFormData(true);
          }
        };

        return (
          <WorkflowLayout
            workflowHeader={{
              title: "Workflow Layout Form",
              onCancel: () => {},
              completeLabel: "Save",
              onComplete: onSave,
              stepperTabs: { currentStep, onChange: setCurrentStep },
            }}
            steps={steps}
          />
        );
      }}
    </Observer>
  );
}

function AuthorDetails({ formState }: { formState: FormValue }) {
  return (
    <Observer>
      {() => (
        <div css={Css.p3.mx("auto").maxwPx(contentMaxWidthPx).w100.$}>
          <h1 css={Css.mb1.$}>Author Details</h1>
          <div css={Css.mb2.$}>
            <BoundTextField field={formState.firstName} helperText="Required to enable next step" />
          </div>
          <div css={Css.mb2.$}>
            <BoundTextField field={formState.lastName} helperText="Required to enable next step" />
          </div>
        </div>
      )}
    </Observer>
  );
}

function BookList({ formState }: { formState: FormValue }) {
  const columns = useMemo(() => createColumns(formState), [formState]);
  const rows: GridDataRow<Row>[] = useComputed(
    () => [simpleHeader, ...formState.books.rows.map((data) => ({ kind: "data" as const, id: data.id.value!, data }))],
    [],
  );

  return (
    <div css={Css.p3.$}>
      <h1 css={Css.df.aic.$}>
        Books
        <IconButton
          icon="plus"
          onClick={() => formState.books.add({ id: String(formState.books.value?.length || 1) })}
        />
      </h1>
      <GridTable<Row> columns={columns} rows={rows} />
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

function MiscAuthorDetails({ formState, showFormData }: { formState: FormValue; showFormData: boolean }) {
  return (
    <Observer>
      {() => (
        <div css={Css.p3.mx("auto").maxwPx(contentMaxWidthPx).w100.$}>
          <h1 css={Css.mb1.$}>Author Details</h1>
          <div css={Css.mb2.$}>
            <BoundDateField field={formState.birthday} helperText="Required" />
          </div>
          <div css={Css.mb2.$}>
            <BoundNumberField field={formState.heightInInches} />
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
                  <strong>Birthday</strong> {formState.value.birthday?.toString()}
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

// Mimics the centered content column a future layout will own generally — see WorkflowLayout.tsx's docs.
const contentMaxWidthPx = 720;

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
