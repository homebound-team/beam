import { createObjectState, ObjectConfig, ObjectState, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { BoundTextField } from "src/forms/BoundTextField";
import { AuthorInput } from "src/forms/formStateDomain";
import { type } from "src/utils/rtl";

describe("BoundTextField", () => {
  it("shows the current value", async () => {
    const author = createObjectState(formConfig, { firstName: "bob" });
    const r = await render(<BoundTextField field={author.firstName} />);
    expect(r.firstName).toHaveValue("bob");
  });

  it("shows an error message", async () => {
    const author = createObjectState(formConfig, {});
    author.touched = true;
    const r = await render(<BoundTextField field={author.firstName} />);
    expect(r.firstName_errorMsg).toHaveTextContent("Required");
  });

  it("can blur onEnter and call onEnter callback", async () => {
    const autoSave = jest.fn();
    const onEnter = jest.fn();
    const author: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      {},
      { maybeAutoSave: () => autoSave(author.firstName.value) },
    );
    // Given a textfield
    const r = await render(<BoundTextField field={author.firstName} onEnter={onEnter} />);
    // When entering a name
    type(r.firstName, "Brandon");
    // And hitting the Enter key
    fireEvent.keyDown(r.firstName, { key: "Enter" });
    // Then onEnter should be called
    expect(onEnter).toHaveBeenCalledTimes(1);
    // And the Field State's autoSave should have been called.
    expect(autoSave).toHaveBeenCalledWith("Brandon");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  firstName: { type: "value", rules: [required] },
};
