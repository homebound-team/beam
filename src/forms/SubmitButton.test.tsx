import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { click, render } from "@homebound/rtl-utils";
import { jest } from "@jest/globals";
import { act } from "@testing-library/react";
import { AuthorInput } from "src/forms/formStateDomain";
import { SubmitButton } from "src/forms/SubmitButton";

describe("SubmitButton", () => {
  it("disables if the form is clean", async () => {
    const onClick = jest.fn();
    // Given a submit button for a valid form
    const author = createObjectState(formConfig, { id: "a:1", firstName: "f1" });
    const r = await render(<SubmitButton form={author} onClick={onClick} />);

    // Then the submit button is initially disabled because nothing is dirty
    expect(r.submit).not.toBeEnabled();
    // And clicking submit doesn't call the onClick handler
    click(r.submit);
    expect(onClick).not.toHaveBeenCalled();

    // But once we change a field, it becomes enabled (even though its invalid)
    act(() => author.firstName.set(""));
    expect(r.submit).toBeEnabled();
    // Even though it's invalid, so clicking submit still won't do anything
    click(r.submit);
    expect(onClick).not.toHaveBeenCalled();

    // But once we make it valid
    act(() => author.firstName.set("f2"));
    // We can click and submit
    click(r.submit);
    expect(onClick).toHaveBeenCalled();
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

  it("enables for new entities", async () => {
    const onClick = jest.fn();
    // Given a submit button for a valid form
    const author = createObjectState(formConfig, { firstName: "f1" });
    const r = await render(<SubmitButton form={author} onClick={onClick} />);
    // Then the submit button is enabled because we might be duplicating
    expect(r.submit).toBeEnabled();
    click(r.submit);
    expect(onClick).toHaveBeenCalled();
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  id: { type: "value" },
  firstName: { type: "value", rules: [required] },
};
