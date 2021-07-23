import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { click, render } from "@homebound/rtl-utils";
import { BoundSwitchField } from "src/forms";
import { AuthorInput } from "src/forms/formStateDomain";

describe("BoundSwitchField", () => {
  it("should be checked", async () => {
    // Given a formState with true boolean field
    const formState = createObjectState(formConfig, { isAvailable: true });
    // When rendered
    const r = await render(<BoundSwitchField field={formState.isAvailable} />);
    // Expect the BoundSwitchField to be checked
    expect(r.isAvailable()).toBeChecked();
  });

  it("should uncheck when clicked", async () => {
    // Given a rendered checked BoundSwitchField
    const formState = createObjectState(formConfig, { isAvailable: true });
    const { isAvailable } = await render(<BoundSwitchField field={formState.isAvailable} />);

    // When interacting with a BoundSwitchField
    click(isAvailable());

    // Then expect the checkbox to be unchecked and the formState to reflect that state
    expect(isAvailable()).not.toBeChecked();
    expect(formState.isAvailable.value).toBeFalsy();
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  isAvailable: { type: "value", rules: [required] },
};
