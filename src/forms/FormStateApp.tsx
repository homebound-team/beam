import { ObjectConfig, ObjectState, required, useFormState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { useMemo } from "react";
import {
  Button,
  GridColumn,
  GridDataRow,
  GridTable,
  IconButton,
  simpleHeader,
  SimpleHeaderAndDataWith,
} from "src/components";
import { Css } from "src/Css";
import {
  BoundDateField,
  BoundMultiSelectField,
  BoundNumberField,
  BoundSelectField,
  BoundSwitchField,
  BoundTextField,
  BoundToggleChipGroupField,
  FormDivider,
} from "src/forms";
import { BoundCheckboxGroupField } from "src/forms/BoundCheckboxGroupField";
import { FormLines } from "src/forms/FormLines";
import { AuthorInput } from "src/forms/formStateDomain";
import { useComputed } from "src/hooks";
import { CheckboxGroupItemOption } from "src/inputs";

export function FormStateApp() {
  // Simulate getting the initial form state back from a server call
  const queryResponse = {
    firstName: "a1",
    books: [...Array(2)].map((_, i) => ({
      id: String(i),
      title: `b${i}`,
      classification: { number: `10${i + 1}`, category: `Test Category ${i}` },
    })),
  };

  const formState = useFormState({
    config: formConfig,
    init: queryResponse,
    addRules(state) {
      state.lastName.rules.push(() => {
        return state.firstName.value === state.lastName.value ? "Last name cannot equal first name" : undefined;
      });
    },
  });

  const columns = useMemo(() => createColumns(formState), [formState]);
  const rows: GridDataRow<Row>[] = useComputed(
    () => [simpleHeader, ...formState.books.rows.map((data) => ({ kind: "data" as const, id: data.id.value!, data }))],
    [],
  );

  const sports = [
    { id: "s:1", name: "Football" },
    { id: "s:2", name: "Soccer" },
  ];

  const colors: CheckboxGroupItemOption[] = [
    { value: "c:1", label: "Blue" },
    { value: "c:2", label: "Red" },
    { value: "c:3", label: "Green" },
  ];

  const shapes = [
    { id: "sh:1", name: "Triangle" },
    { id: "sh:2", name: "Square" },
    { id: "sh:3", name: "Circle" },
  ];

  const animals = [
    { value: "a:1", label: "Cat" },
    { value: "a:2", label: "Dog" },
    { value: "a:3", label: "Fish" },
    { value: "a:4", label: "Iguana" },
    { value: "a:5", label: "Turtle" },
  ];

  return (
    <Observer>
      {() => (
        <div>
          <header>
            <FormLines labelSuffix={{ required: "*", optional: "(Opt)" }}>
              <b>Author</b>
              <BoundTextField field={formState.firstName} />
              <BoundTextField field={formState.middleInitial} />
              <BoundTextField field={formState.lastName} />
              <BoundDateField field={formState.birthday} />
              <BoundNumberField field={formState.heightInInches} />
              <FormDivider />
              <BoundSelectField field={formState.favoriteSport} options={sports} />
              <BoundMultiSelectField field={formState.favoriteShapes} options={shapes} />
              <BoundCheckboxGroupField field={formState.favoriteColors} options={colors} />
              <BoundToggleChipGroupField field={formState.animals} options={animals} />
              <FormDivider />
              <BoundSwitchField field={formState.isAvailable} />
            </FormLines>

            <div>
              <strong>
                Books
                <IconButton
                  icon="plus"
                  onClick={() => formState.books.add({ id: String(formState.books.value.length) })}
                />
              </strong>
              <GridTable<Row> columns={columns} rows={rows} observeRows={true} />
            </div>

            <div css={Css.df.childGap1.$}>
              <Button onClick={() => formState.reset()} label="Cancel" />
              <Button
                onClick={() => {
                  if (formState.canSave()) {
                    formState.save();
                  }
                }}
                label="Save"
              />
            </div>
          </header>
        </div>
      )}
    </Observer>
  );
}

type Row = SimpleHeaderAndDataWith<FormValue["books"]["rows"][number]>;

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

type FormValue = ObjectState<AuthorInput>;

// Configure the fields/behavior for AuthorInput's fields
export const formConfig: ObjectConfig<AuthorInput> = {
  firstName: { type: "value", rules: [required] },
  middleInitial: { type: "value" },
  lastName: { type: "value", rules: [required] },
  birthday: { type: "value", rules: [required] },
  heightInInches: { type: "value", rules: [required] },
  favoriteSport: { type: "value", rules: [required] },
  favoriteColors: { type: "value", rules: [required] },
  favoriteShapes: { type: "value", rules: [required] },
  books: {
    type: "list",
    rules: [({ value }) => ((value || []).length === 0 ? "Empty" : undefined)],
    config: {
      id: { type: "value" },
      title: { type: "value", rules: [required] },
    },
  },
  animals: { type: "value", rules: [required] },
  isAvailable: { type: "value" },
};
