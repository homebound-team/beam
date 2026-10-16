import { createObjectState, type ObjectConfig, required } from "@homebound/form-state";
import { BoundMenuSelectField } from "src/forms/BoundMenuSelectField";
import { render, select } from "src/utils/rtl";

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
