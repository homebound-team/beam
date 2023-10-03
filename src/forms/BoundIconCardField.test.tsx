import { ObjectConfig, ObjectState, createObjectState, required } from "@homebound/form-state";
import { BoundIconCardField } from "./BoundIconCardField";
import { click, render } from "src/utils/rtl";
import { AuthorInput } from "./formStateDomain";

const formConfig: ObjectConfig<AuthorInput> = {
  isAvailable: { type: "value", rules: [required] },
};

const formConfigReadOnly: ObjectConfig<AuthorInput> = {
  isAvailable: { type: "value", rules: [required], readOnly: true },
};

describe("BoundIconCardField", () => {
  it("should be selected", async () => {
    // Given a formState with true boolean field
    const formState = createObjectState(formConfig, { isAvailable: true });
    // When rendered
    const r = await render(<BoundIconCardField icon="check" field={formState.isAvailable} />);
    // Then the BoundCheckboxField should be checked
    expect(r.isAvailable_value).toBeChecked();
  });

  it("should uncheck when clicked", async () => {
    // Given a rendered checked BoundCheckboxField
    const formState = createObjectState(formConfig, { isAvailable: true });
    const r = await render(<BoundIconCardField icon="check" field={formState.isAvailable} />);
    // When interacting with a BoundCheckboxField
    click(r.isAvailable);
    // Then expect the checkbox to be unchecked and the formState to reflect that state
    expect(r.isAvailable).not.toBeChecked();
    expect(formState.isAvailable.value).toBeFalsy();
  });

  it("triggers 'maybeAutoSave' on change", async () => {
    const autoSave = jest.fn();
    // Given a BoundCheckboxField with auto save
    const formState: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      { isAvailable: true },
      { maybeAutoSave: () => autoSave(formState.isAvailable.value) },
    );
    const r = await render(<BoundIconCardField icon="check" field={formState.isAvailable} />);

    // When toggling the checkbox off
    click(r.isAvailable);
    // Then the callback should be triggered with the current value
    expect(autoSave).toBeCalledWith(false);
  });
  it("disables when field is readonly", async () => {
    // Given a readOnly BoundCheckboxField
    const formState: ObjectState<AuthorInput> = createObjectState(formConfigReadOnly, { isAvailable: true });
    const r = await render(<BoundIconCardField icon="check" field={formState.isAvailable} />);

    // Then the checkbox should be disabled
    expect(r.isAvailable).toBeDisabled();
  });
});
