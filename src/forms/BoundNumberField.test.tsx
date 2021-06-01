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

  it("drops the 'in cents' suffix from labels", async () => {
    const author = createObjectState(formConfig, { royaltiesInCents: 1_00 });
    const r = await render(<BoundNumberField field={author.royaltiesInCents} />);
    expect(r.royalties_label()).toHaveTextContent("Royalties");
    expect(r.royalties_label()).not.toHaveTextContent("Cents");
    expect(r.royalties()).toHaveValue("$1.00");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  heightInInches: { type: "value", rules: [required] },
  royaltiesInCents: { type: "value" },
};
