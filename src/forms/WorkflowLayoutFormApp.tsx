import { ObjectConfig, ObjectState, required, useFormState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { useState } from "react";
import { Css } from "src/Css";
import { BoundDateField } from "src/forms/BoundDateField";
import { BoundNumberField } from "src/forms/BoundNumberField";
import { BoundTextField } from "src/forms/BoundTextField";
import { AuthorInput } from "src/forms/formStateDomain";
import { FormSectionLayout, WorkflowLayout, WorkflowLayoutStep } from "src/layouts";

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
  const [showFormData, setShowFormData] = useState(false);

  return (
    <Observer>
      {() => {
        const step1Valid = formState.firstName.valid && formState.lastName.valid;
        const step2Valid = formState.books.valid;

        const steps: WorkflowLayoutStep[] = [
          {
            label: "Author Details",
            completed: step1Valid,
            content: <AuthorDetails formState={formState} />,
          },
          {
            label: "Books",
            completed: step2Valid,
            disabled: !step1Valid,
            content: <BookList formState={formState} />,
          },
          {
            label: "Miscellaneous Author Information",
            completed: formState.birthday.valid,
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
            title="Workflow Layout Form"
            onCancel={() => {}}
            completeLabel="Save"
            onComplete={onSave}
            isDirty={() => formState.dirty}
            steps={steps}
          />
        );
      }}
    </Observer>
  );
}

function AuthorDetails({ formState }: { formState: FormValue }) {
  return (
    <FormSectionLayout
      title="Author Details"
      sections={[
        {
          title: "Name",
          fields: (
            <>
              <div css={Css.mb2.$}>
                <BoundTextField field={formState.firstName} helperText="Required to enable next step" />
              </div>
              <div css={Css.mb2.$}>
                <BoundTextField field={formState.lastName} helperText="Required to enable next step" />
              </div>
            </>
          ),
        },
      ]}
    />
  );
}

function BookList({ formState }: { formState: FormValue }) {
  return (
    <Observer>
      {() => (
        <FormSectionLayout
          title="Books"
          sections={[
            {
              title: "Books",
              actions: [
                {
                  label: "Add Book",
                  icon: "plus",
                  onClick: () =>
                    formState.books.add({
                      id: String(formState.books.value?.length + 1 || 1),
                      order: formState.books.value?.length ?? 0,
                    }),
                },
              ],
              childSections: formState.books.rows.map((row, i) => ({
                id: row.id.value!,
                title: `Book ${i + 1}`,
                orderField: row.order,
                fields: <BoundTextField label="Title" field={row.title} />,
                actions: [
                  { label: "Remove", icon: "x", variant: "tertiary", onClick: () => formState.books.remove(row.value) },
                ],
              })),
            },
          ]}
        />
      )}
    </Observer>
  );
}

function MiscAuthorDetails({ formState, showFormData }: { formState: FormValue; showFormData: boolean }) {
  return (
    <FormSectionLayout
      title="Miscellaneous Details"
      sections={[
        {
          title: "Details",
          fields: (
            <>
              <div css={Css.mb2.$}>
                <BoundDateField field={formState.birthday} helperText="Required" />
              </div>
              <div css={Css.mb2.$}>
                <BoundNumberField field={formState.heightInInches} />
              </div>
            </>
          ),
        },
        ...(showFormData
          ? [
              {
                title: "Form saved!",
                fields: (
                  <Observer>
                    {() => (
                      <ul>
                        <li>
                          <strong>First Name</strong> {formState.value.firstName}
                        </li>
                        <li>
                          <strong>Last Name</strong> {formState.value.lastName}
                        </li>
                        <li>
                          <strong>Books</strong>{" "}
                          {[...(formState.value.books ?? [])]
                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                            .map((b) => b.title)
                            .join(", ")}
                        </li>
                        <li>
                          <strong>Birthday</strong> {formState.value.birthday?.toString()}
                        </li>
                        <li>
                          <strong>Height</strong> {formState.value.heightInInches}
                        </li>
                      </ul>
                    )}
                  </Observer>
                ),
              },
            ]
          : []),
      ]}
    />
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
      order: { type: "value" },
      title: { type: "value", rules: [required] },
    },
  },
};
