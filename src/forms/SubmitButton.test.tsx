import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { click, render } from "@homebound/rtl-utils";
import { act } from "@testing-library/react";
import { AuthorInput } from "src/forms/formStateDomain";
import { SubmitButton } from "src/forms/SubmitButton";

describe("SubmitButton", () => {
  it("disables if the form is clean", async () => {
    const onClick = jest.fn();
    // Given a submit button for an invalid form
    const author = createObjectState(formConfig, { firstName: "" });
    const r = await render(<SubmitButton form={author} onClick={onClick} />);
    // Then the submit button is initially disabled because nothing is dirty
    expect(r.submit).not.toBeEnabled();
    // And clicking submit doesn't call the onClick handler
    click(r.submit);
    expect(onClick).not.toHaveBeenCalled();
    // But once we touch a field, it becomes enabled
    act(() => author.firstName.set("f1"));
    expect(r.submit).toBeEnabled();
  });

  it("disables if the form is dirty but overridden via prop", async () => {
    const onClick = jest.fn();
    // Given a form is dirty so saveable to formState
    const author = createObjectState(formConfig, { firstName: "f1" });
    act(() => author.firstName.set("f2"));
    expect(author.dirty).toBe(true);
    // But has a disabled prop on it
    const r = await render(<SubmitButton form={author} onClick={onClick} disabled={true} />);
    // Then it's not enabled
    expect(r.submit).not.toBeEnabled();
    // And clicking it ignores the handler
    click(r.submit);
    expect(onClick).not.toHaveBeenCalled();
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  firstName: { type: "value", rules: [required] },
};
