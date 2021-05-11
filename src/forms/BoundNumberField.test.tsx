import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { BoundNumberField } from "src/forms/BoundNumberField";
import { AuthorInput } from "src/forms/formStateDomain";

describe("BoundNumberField", () => {
  it("shows the current value", async () => {
    const author = createObjectState(formConfig, { heightInInches: 10 });
    const { heightInInches } = await render(<BoundNumberField field={author.heightInInches} />);
    expect(heightInInches()).toHaveValue("10");
  });

  it("shows an error message", async () => {
    const author = createObjectState(formConfig, {});
    author.touched = true;
    const { heightInInches_errorMsg } = await render(<BoundNumberField field={author.heightInInches} />);
    expect(heightInInches_errorMsg()).toHaveTextContent("Required");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  heightInInches: { type: "value", rules: [required] },
};
