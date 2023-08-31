import { createObjectState, ObjectConfig, ObjectState, required } from "@homebound/form-state";
import { click, render } from "@homebound/rtl-utils";
import { BoundSwitchField } from "src/forms";
import { AuthorInput } from "src/forms/formStateDomain";

describe("BoundSwitchField", () => {
  it("should be checked", async () => {
    // Given a formState with true boolean field
    const formState = createObjectState(formConfig, { isAvailable: true });
    // When rendered
    const r = await render(<BoundSwitchField field={formState.isAvailable} />);
    // Then the BoundSwitchField should be checked
    expect(r.isAvailable()).toBeChecked();
  });

  it("should uncheck when clicked", async () => {
    const autoSave = jest.fn();
    // Given a rendered checked BoundSwitchField
    const formState: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      { isAvailable: true },
      { maybeAutoSave: () => autoSave(formState.isAvailable.value) },
    );
    const r = await render(<BoundSwitchField field={formState.isAvailable} />);

    // When interacting with a BoundSwitchField
    click(r.isAvailable());

    // Then expect the checkbox to be unchecked and the formState to reflect that state
    expect(r.isAvailable()).not.toBeChecked();
    expect(formState.isAvailable.value).toBeFalsy();
    // And auto save was triggered with the correct value
    expect(autoSave).toBeCalledWith(false);
  });

  it("should be disabled when field is readOnly", async () => {
    // Given a formState field marked as readOnly
    const formState = createObjectState(formConfigReadOnly, { isAvailable: true });

    // When rendered
    const r = await render(<BoundSwitchField field={formState.isAvailable} />);

    // Then the BoundSwitchField should be disabled
    expect(r.isAvailable()).toBeDisabled();
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  isAvailable: { type: "value", rules: [required] },
};

const formConfigReadOnly: ObjectConfig<AuthorInput> = {
  isAvailable: { type: "value", rules: [required], readOnly: true },
};
