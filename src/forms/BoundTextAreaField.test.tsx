import { createObjectState, ObjectConfig, ObjectState, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { BoundTextAreaField } from "src/forms/BoundTextAreaField";
import { AuthorInput } from "src/forms/formStateDomain";
import { blur, focus, type } from "src/utils/rtl";

describe("BoundTextAreaField", () => {
  it("shows the current value", async () => {
    const author = createObjectState(formConfig, { firstName: "bob" });
    const { firstName } = await render(<BoundTextAreaField field={author.firstName} />);
    expect(firstName()).toHaveValue("bob");
  });

  it("shows an error message", async () => {
    const author = createObjectState(formConfig, {});
    author.touched = true;
    const { firstName_errorMsg } = await render(<BoundTextAreaField field={author.firstName} />);
    expect(firstName_errorMsg()).toHaveTextContent("Required");
  });

  it("trigger onFocus and onBlur callbacks", async () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    // Given a BoundTextAreaField with onFocus and onBlur methods
    const formState = createObjectState(formConfig, {});
    const r = await render(<BoundTextAreaField field={formState.firstName} onBlur={onBlur} onFocus={onFocus} />);

    // When focus is triggered
    focus(r.firstName);
    // Then the callback should be triggered
    expect(onFocus).toBeCalledTimes(1);

    // When blur is triggered
    blur(r.firstName);
    // Then the callback should be triggered
    expect(onBlur).toBeCalledTimes(1);
  });

  it("triggers 'maybeAutoSave' on enter", async () => {
    const autoSave = jest.fn();
    // Given a BoundTextAreaField with auto save
    const formState: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      { firstName: "First" },
      { maybeAutoSave: () => autoSave(formState.firstName.value) },
    );
    const r = await render(<BoundTextAreaField field={formState.firstName} preventNewLines />);

    // When changing the value
    type(r.firstName, "First Name");
    // And hitting the enter key
    fireEvent.keyDown(r.firstName(), { key: "Enter" });
    // Then the callback should be triggered with the current value
    expect(autoSave).toBeCalledWith("First Name");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  firstName: { type: "value", rules: [required] },
};
