import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { BoundSelectField } from "src/forms/BoundSelectField";
import { AuthorInput } from "src/forms/formStateDomain";

const sports = [
  { id: "s:1", name: "Football" },
  { id: "s:2", name: "Soccer" },
];

describe("BoundSelectField", () => {
  it("shows the current value", async () => {
    const author = createObjectState(formConfig, { favoriteSport: "s:1" });
    const { favoriteSport } = await render(<BoundSelectField field={author.favoriteSport} options={sports} />);
    expect(favoriteSport()).toHaveValue("Football");
  });

  it("shows the error message", async () => {
    const author = createObjectState(formConfig, {});
    author.favoriteSport.touched = true;
    const { favoriteSport_errorMsg } = await render(<BoundSelectField field={author.favoriteSport} options={sports} />);
    expect(favoriteSport_errorMsg()).toHaveTextContent("Required");
  });

  it("shows the label", async () => {
    const author = createObjectState(formConfig, { favoriteSport: "s:1" });
    const { favoriteSport_label } = await render(<BoundSelectField field={author.favoriteSport} options={sports} />);
    expect(favoriteSport_label()).toHaveTextContent("Favorite Sport");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  favoriteSport: { type: "value", rules: [required] },
};
