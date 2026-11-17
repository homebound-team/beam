import { createObjectState, type ObjectConfig, type ObjectState, required } from "@homebound/form-state";
import { useState } from "react";
import { BoundMenuSelectField } from "src/forms/BoundMenuSelectField";
import { render, select, selectAndWait } from "src/utils/rtl";

describe("BoundMenuSelectField", () => {
  it("binds a single value to the field", async () => {
    // Given a form with a single-value field
    const formState = createObjectState(formConfig(), {});
    const r = await render(<BoundMenuSelectField field={formState.colorId} options={colors()} />);
    // When selecting an option
    select(r.colorId, "Blue");
    // Then the field is set
    expect(formState.colorId.value).toBe("b");
    expect(r.colorId).toHaveTextContent("Blue");
  });

  it("shows errors once touched", async () => {
    // Given a required field that has been touched
    const formState = createObjectState(formConfig(), {});
    formState.colorId.touched = true;
    const r = await render(<BoundMenuSelectField field={formState.colorId} options={colors()} />);
    // Then the required error renders
    expect(r.colorId_errorMsg).toHaveTextContent("Required");
  });

  it("sets the option the caller creates from onAddNew", async () => {
    // Given a field whose onAddNew creates an option and sets it
    const formState = createObjectState(formConfig(), {});
    const r = await render(<TestAddNewField formState={formState} />);
    // When adding a value from the search
    await selectAndWait(r.colorId, "Teal", { addNew: true });
    // Then the field holds the new option
    expect(formState.colorId.value).toBe("t");
    expect(r.colorId).toHaveTextContent("Teal");
  });
});

type FormValue = { colorId?: string | null };

function formConfig(): ObjectConfig<FormValue> {
  return { colorId: { type: "value", rules: [required] } };
}

function colors() {
  return [
    { id: "r", name: "Red" },
    { id: "b", name: "Blue" },
  ];
}

function TestAddNewField(props: { formState: ObjectState<FormValue> }) {
  const { formState } = props;
  const [options, setOptions] = useState(colors());
  return (
    <BoundMenuSelectField
      field={formState.colorId}
      options={options}
      onAddNew={(name) => {
        setOptions([...options, { id: "t", name }]);
        formState.colorId.set("t");
      }}
    />
  );
}
