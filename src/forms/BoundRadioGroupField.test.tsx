import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { RadioFieldOption } from "src/components/RadioGroupField";
import { BoundRadioGroupField } from "src/forms/BoundRadioGroupField";
import { AuthorInput } from "src/forms/formStateDomain";

const colors: RadioFieldOption<string>[] = [
  { value: "c:1", label: "Blue" },
  { value: "c:2", label: "Red" },
  { value: "c:3", label: "Green" },
];

describe("BoundRadioGroupField", () => {
  it("shows the label", async () => {
    const author = createObjectState(formConfig, {});
    const { favoriteSport_label } = await render(
      <BoundRadioGroupField field={author.favoriteSport} options={colors} />,
    );
    expect(favoriteSport_label()).toHaveTextContent("Favorite Sport");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  favoriteSport: { type: "value", rules: [required] },
};
