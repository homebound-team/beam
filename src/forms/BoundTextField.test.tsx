import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { BoundTextField } from "src/forms/BoundTextField";
import { AuthorInput } from "src/forms/formStateDomain";

describe("BoundTextField", () => {
  it("shows the current value", async () => {
    const author = createObjectState(formConfig, { firstName: "bob" });
    const { firstName } = await render(<BoundTextField field={author.firstName} />);
    expect(firstName()).toHaveValue("bob");
  });

  it("shows an error message", async () => {
    const author = createObjectState(formConfig, {});
    author.touched = true;
    const { firstName_errorMsg } = await render(<BoundTextField field={author.firstName} />);
    expect(firstName_errorMsg()).toHaveTextContent("Required");
  });

  it("shows an error message", async () => {
    const author = createObjectState(formConfig, {});
    author.touched = true;
    const { firstName_errorMsg } = await render(<BoundTextField field={author.firstName} />);
    expect(firstName_errorMsg()).toHaveTextContent("Required");
  });

  it("can blur on Enter and call onEnter callback", async () => {
    const onBlur = jest.fn();
    const onEnter = jest.fn();
    const author = createObjectState(formConfig, {}, { onBlur });
    // Given a textfield
    const r = await render(<BoundTextField field={author.firstName} onEnter={onEnter} />);
    // With focus
    r.firstName().focus();
    expect(r.firstName()).toHaveFocus();
    // When hitting the Enter key
    fireEvent.keyDown(r.firstName(), { key: "Enter" });
    // Then onEnter should be called
    expect(onEnter).toHaveBeenCalledTimes(1);
    // And the Field State's onBlur should have been called.
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  firstName: { type: "value", rules: [required] },
};
