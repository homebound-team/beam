import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { click, render } from "@homebound/rtl-utils";
import { BoundCheckboxField } from "src/forms";
import { AuthorInput } from "src/forms/formStateDomain";

const formConfig: ObjectConfig<AuthorInput> = {
  isAvailable: { type: "value", rules: [required] },
};

describe("BoundCheckboxField", () => {
  it("should be checked", async () => {
    // Given a formState with true boolean field
    const formState = createObjectState(formConfig, { isAvailable: true });

    // When rendered
    const { isAvailable } = await render(<BoundCheckboxField field={formState.isAvailable} />);

    // Expect the BoundCheckboxField to be checked
    expect(isAvailable()).toBeChecked();
  });

  it("should uncheck when clicked", async () => {
    // Given a rendered checked BoundCheckboxField
    const formState = createObjectState(formConfig, { isAvailable: true });
    const { isAvailable } = await render(<BoundCheckboxField field={formState.isAvailable} />);

    // When interacting with a BoundCheckboxField
    click(isAvailable());

    // Then expect the checkbox to be unchecked and the formState to reflect that state
    expect(isAvailable()).not.toBeChecked();
    expect(formState.isAvailable.value).toBeFalsy();
  });
});
