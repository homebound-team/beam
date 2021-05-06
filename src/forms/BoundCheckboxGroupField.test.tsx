import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { CheckboxGroupItemOption } from "src/components/CheckboxGroup";
import { BoundCheckboxGroupField } from "src/forms/BoundCheckboxGroupField";
import { AuthorInput } from "src/forms/formStateDomain";

const colors: CheckboxGroupItemOption[] = [
  { value: "c:1", label: "Blue" },
  { value: "c:2", label: "Red" },
  { value: "c:3", label: "Green" },
];

describe("BoundCheckboxGroupField", () => {
  it("shows the label", async () => {
    const author = createObjectState(formConfig, {});
    const { favoriteColors_label } = await render(
      <BoundCheckboxGroupField field={author.favoriteColors} options={colors} />,
    );
    expect(favoriteColors_label()).toHaveTextContent("Favorite Colors");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  favoriteColors: { type: "value", rules: [required] },
};
