import { createObjectState, type ObjectConfig } from "@homebound/form-state";
import { BoundMenuMultiSelectField } from "src/forms/BoundMenuMultiSelectField";
import { render, select } from "src/utils/rtl";

describe("BoundMenuMultiSelectField", () => {
  it("binds multiple values to the field", async () => {
    // Given a form with a multi-value field
    const formState = createObjectState(formConfig(), {});
    const r = await render(<BoundMenuMultiSelectField field={formState.colorIds} options={colors()} />);
    // When selecting two options
    select(r.colorIds, ["Red", "Blue"]);
    // Then the field holds both values
    expect(formState.colorIds.value).toEqual(["r", "b"]);
    expect(r.colorIds_count).toHaveTextContent("2");
  });
});

type FormValue = { colorIds?: string[] | null };

function formConfig(): ObjectConfig<FormValue> {
  return { colorIds: { type: "value" } };
}

function colors() {
  return [
    { id: "r", name: "Red" },
    { id: "b", name: "Blue" },
  ];
}
