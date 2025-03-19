import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { render } from "src/utils/rtl";
import { boundCheckboxField, BoundForm, boundTextField } from "./BoundForm";
import { AuthorInput } from "./formStateDomain";

const formConfig: ObjectConfig<AuthorInput> = {
  isAvailable: { type: "value", rules: [required] },
  firstName: { type: "value", rules: [required] },
  lastName: { type: "value" },
};

describe("BoundForm", () => {
  it("renders rows of fields", async () => {
    // Given a formState with configured fields
    const formState = createObjectState(formConfig, { isAvailable: true, firstName: "John", lastName: "Doe" });

    // When rendered with two rows of inputs
    const r = await render(
      <BoundForm
        formState={formState}
        rows={[{ firstName: boundTextField(), lastName: boundTextField() }, { isAvailable: boundCheckboxField() }]}
      />,
    );

    // Then expect two rows to of fields to be rendered
    expect(r.getAllByTestId("boundFormRow")).toHaveLength(2);

    // And the individual inputs to be rendered with their values
    expect(r.firstName).toHaveValue("John");
    expect(r.lastName).toHaveValue("Doe");
    expect(r.isAvailable).toBeChecked();
  });
});
