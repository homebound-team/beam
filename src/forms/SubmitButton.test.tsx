import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { click, render } from "@homebound/rtl-utils";
import { act } from "@testing-library/react";
import { AuthorInput } from "src/forms/formStateDomain";
import { SubmitButton } from "src/forms/SubmitButton";

describe("SubmitButton", () => {
  it("disables if the form is invalid", async () => {
    const onClick = jest.fn();
    // Given a submit button for an invalid form
    const author = createObjectState(formConfig, { firstName: "" });
    const r = await render(<SubmitButton form={author} onClick={onClick} />);
    // Then the submit button is initially enabled
    expect(r.submit).toBeEnabled();
    // But once we touch a field, it becomes disabled
    act(() => author.firstName.blur());
    expect(r.submit).not.toBeEnabled();
    // And clicking submit doesn't call the onClick handler
    click(r.submit);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disables if the form is valid but overridden via prop", async () => {
    const onClick = jest.fn();
    const author = createObjectState(formConfig, { firstName: "f1" });
    const r = await render(<SubmitButton form={author} onClick={onClick} disabled={true} />);
    expect(r.submit).not.toBeEnabled();
    click(r.submit);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("enables if the form is valid", async () => {
    const onClick = jest.fn();
    const author = createObjectState(formConfig, { firstName: "r1" });
    const r = await render(<SubmitButton form={author} onClick={onClick} />);
    expect(r.submit).toBeEnabled();
    click(r.submit);
    expect(onClick).toHaveBeenCalled();
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  firstName: { type: "value", rules: [required] },
};
