import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { SelectCardGridGroupItemOption } from "src/inputs/SelectCard/types";
import { click, render } from "src/utils/rtl";
import { BoundSelectCardGroupField } from "./BoundSelectCardGroupField";

enum Category {
  Math,
  History,
  Na,
}

function createCategories(): SelectCardGridGroupItemOption<Category>[] {
  return [
    { icon: "abacus", label: "Math", description: "Numbers and equations", value: Category.Math },
    { icon: "archive", label: "History", value: Category.History },
    { icon: "remove", label: "Not Applicable", value: Category.Na },
  ];
}

type Form = { favoriteGenre?: Category | null };

describe("BoundSelectCardGroupField", () => {
  it("updates the field value when a radio option is selected", async () => {
    const author = createObjectState(formConfig, { favoriteGenre: Category.Math });
    const r = await render(<BoundSelectCardGroupField field={author.favoriteGenre} options={createCategories()} />);
    // When selecting History
    click(r.favoriteGenre_history);
    // Then the field stores History
    expect(author.favoriteGenre.value).toBe(Category.History);
  });

  it("disables all cards when the field is readOnly", async () => {
    const author = createObjectState(formConfigReadOnly, { favoriteGenre: Category.Math });
    const r = await render(<BoundSelectCardGroupField field={author.favoriteGenre} options={createCategories()} />);
    // Then every option input is disabled
    expect(r.favoriteGenre_math_value).toBeDisabled();
    expect(r.favoriteGenre_history_value).toBeDisabled();
  });
});

const formConfigReadOnly: ObjectConfig<Form> = {
  favoriteGenre: { type: "value", rules: [required], readOnly: true },
};

const formConfig: ObjectConfig<Form> = {
  favoriteGenre: { type: "value", rules: [required] },
};
