import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
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
});

const formConfig: ObjectConfig<AuthorInput> = {
  firstName: { type: "value", rules: [required] },
};
