import { IconCardGroupItemOption } from "src/inputs/IconCardGroup";
import { AuthorInput } from "./formStateDomain";
import { ObjectConfig, ObjectState, createObjectState, required } from "@homebound/form-state";
import { BoundIconCardGroupField } from "./BoundIconCardGroupField";
import { click, render } from "src/utils/rtl";

enum Category {
  Math,
  History,
  Finance,
  Engineering,
  Management,
  Media,
}

const categories: IconCardGroupItemOption<Category>[] = [
  { icon: "abacus", label: "Math", value: Category.Math },
  { icon: "archive", label: "History", value: Category.History },
  { icon: "dollar", label: "Finance", value: Category.Finance },
  { icon: "hardHat", label: "Engineering", value: Category.Engineering },
  { icon: "kanban", label: "Management", value: Category.Management },
  { icon: "camera", label: "Media", value: Category.Media },
];

type NewAuthor = Omit<AuthorInput, "favoriteGenres"> & { favoriteGenres?: Category[] | null };

describe("BoundIconCardGroupField", () => {
  it("shows the label", async () => {
    const author = createObjectState(formConfig, { favoriteGenres: [Category.Math] });
    const r = await render(<BoundIconCardGroupField field={author.favoriteGenres} options={categories} />);
    expect(r.favoriteGenres_label).toHaveTextContent("Favorite Genres");
  });
  it("triggers 'maybeAutoSave' on change", async () => {
    const autoSave = jest.fn();
    // Given a BoundIconCardGroupField with auto save
    const author: ObjectState<NewAuthor> = createObjectState(
      formConfig,
      {},
      { maybeAutoSave: () => autoSave(author.favoriteGenres.value) },
    );
    const r = await render(<BoundIconCardGroupField field={author.favoriteGenres} options={categories} />);

    // When toggling the checkbox off
    click(r.favoriteGenres_Math);
    // Then the callback should be triggered with the current value
    expect(autoSave).toBeCalledWith([Category.Math]);
  });
});

const formConfig: ObjectConfig<NewAuthor> = {
  favoriteGenres: { type: "value", rules: [required], strictOrder: false },
};
