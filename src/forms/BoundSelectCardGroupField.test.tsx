import { createObjectState, ObjectConfig, ObjectState, required } from "@homebound/form-state";
import { SelectCardGroupItemOption } from "src/inputs/SelectCardGroup";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";
import { BoundSelectCardGroupField } from "./BoundSelectCardGroupField";
import { AuthorInput } from "./formStateDomain";

enum Category {
  Math,
  History,
  Finance,
  Engineering,
  Management,
  Media,
}

const categories: SelectCardGroupItemOption<Category>[] = [
  { icon: "abacus", label: "Math", description: "Numbers and equations", value: Category.Math },
  { icon: "archive", label: "History", value: Category.History },
  { icon: "dollar", label: "Finance", value: Category.Finance },
  { icon: "hardHat", label: "Engineering", value: Category.Engineering },
  { icon: "columns", label: "Management", value: Category.Management },
  { icon: "camera", label: "Media", value: Category.Media },
];

type NewAuthor = Omit<AuthorInput, "favoriteGenres"> & { favoriteGenres?: Category[] | null };

describe("BoundSelectCardGroupField", () => {
  it("shows the label", async () => {
    const author = createObjectState(formConfig, { favoriteGenres: [Category.Math] });
    const r = await render(<BoundSelectCardGroupField field={author.favoriteGenres} options={categories} />);
    expect(r.favoriteGenres_label).toHaveTextContent("Favorite Genres");
  });

  it("renders option descriptions", async () => {
    const author = createObjectState(formConfig, { favoriteGenres: [Category.Math] });
    const r = await render(<BoundSelectCardGroupField field={author.favoriteGenres} options={categories} />);
    expect(r.favoriteGenres_Math).toHaveTextContent("Numbers and equations");
  });

  it("triggers 'maybeAutoSave' on change", async () => {
    const autoSave = vi.fn();
    // Given a BoundSelectCardGroupField with auto save
    const author: ObjectState<NewAuthor> = createObjectState(
      formConfig,
      {},
      { maybeAutoSave: () => autoSave(author.favoriteGenres.value) },
    );
    const r = await render(<BoundSelectCardGroupField field={author.favoriteGenres} options={categories} />);

    // When toggling the checkbox off
    click(r.favoriteGenres_Math);
    // Then the callback should be triggered with the current value
    expect(autoSave).toBeCalledWith([Category.Math]);
  });
});

const formConfig: ObjectConfig<NewAuthor> = {
  favoriteGenres: { type: "value", rules: [required], strictOrder: false },
};
