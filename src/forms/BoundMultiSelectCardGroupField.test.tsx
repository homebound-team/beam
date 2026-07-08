import { createObjectState, ObjectConfig, ObjectState, required } from "@homebound/form-state";
import { SelectCardGridGroupItemOption } from "src/inputs/SelectCard/types";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";
import { BoundMultiSelectCardGroupField } from "./BoundMultiSelectCardGroupField";
import { AuthorInput } from "./formStateDomain";

enum Category {
  Math,
  History,
  Finance,
  Engineering,
  Management,
  Media,
  Na,
}

function createCategories(): SelectCardGridGroupItemOption<Category>[] {
  return [
    { icon: "abacus", label: "Math", description: "Numbers and equations", value: Category.Math },
    { icon: "archive", label: "History", value: Category.History },
    { icon: "dollar", label: "Finance", value: Category.Finance },
    { icon: "hardHat", label: "Engineering", value: Category.Engineering },
    { icon: "columns", label: "Management", value: Category.Management },
    { icon: "camera", label: "Media", value: Category.Media },
    { icon: "remove", label: "Not Applicable", value: Category.Na, selectionBehavior: "exclusive" },
  ];
}

type NewAuthor = Omit<AuthorInput, "favoriteGenres"> & { favoriteGenres?: Category[] | null };

describe("BoundMultiSelectCardGroupField", () => {
  it("shows the label", async () => {
    const author = createObjectState(formConfig, { favoriteGenres: [Category.Math] });
    const r = await render(
      <BoundMultiSelectCardGroupField field={author.favoriteGenres} options={createCategories()} />,
    );
    expect(r.favoriteGenres_label).toHaveTextContent("Favorite Genres");
  });

  it("renders option descriptions", async () => {
    const author = createObjectState(formConfig, { favoriteGenres: [Category.Math] });
    const r = await render(
      <BoundMultiSelectCardGroupField field={author.favoriteGenres} options={createCategories()} />,
    );
    expect(r.favoriteGenres_math).toHaveTextContent("Numbers and equations");
  });

  it("triggers 'maybeAutoSave' on change", async () => {
    const autoSave = vi.fn();
    // Given a BoundMultiSelectCardGroupField with auto save
    const author: ObjectState<NewAuthor> = createObjectState(
      formConfig,
      { favoriteGenres: [] },
      { maybeAutoSave: () => autoSave(author.favoriteGenres.value) },
    );
    const r = await render(
      <BoundMultiSelectCardGroupField field={author.favoriteGenres} options={createCategories()} />,
    );

    // When toggling the checkbox off
    click(r.favoriteGenres_math);
    // Then the callback should be triggered with the current value
    expect(autoSave).toHaveBeenCalledWith([Category.Math]);
  });

  it("applies exclusive selection behavior through the bound field", async () => {
    const author = createObjectState(formConfig, { favoriteGenres: [Category.Math, Category.History] });
    const r = await render(
      <BoundMultiSelectCardGroupField field={author.favoriteGenres} options={createCategories()} />,
    );
    // When selecting the exclusive option
    click(r.favoriteGenres_notApplicable);
    // Then the field stores only N/A
    expect(author.favoriteGenres.value).toEqual([Category.Na]);
  });

  it("disables all cards when the field is readOnly", async () => {
    const author = createObjectState(formConfigReadOnly, { favoriteGenres: [Category.Math] });
    const r = await render(
      <BoundMultiSelectCardGroupField field={author.favoriteGenres} options={createCategories()} />,
    );
    // Then every option input is disabled
    expect(r.favoriteGenres_math_value).toBeDisabled();
    expect(r.favoriteGenres_history_value).toBeDisabled();
  });

  it("does not change the field value when readOnly and clicked", async () => {
    const author = createObjectState(formConfigReadOnly, { favoriteGenres: [Category.Math] });
    const r = await render(
      <BoundMultiSelectCardGroupField field={author.favoriteGenres} options={createCategories()} />,
    );
    // When clicking another card
    click(r.favoriteGenres_history);
    // Then the value is unchanged
    expect(author.favoriteGenres.value).toEqual([Category.Math]);
  });
});

const formConfigReadOnly: ObjectConfig<NewAuthor> = {
  favoriteGenres: { type: "value", rules: [required], strictOrder: false, readOnly: true },
};

const formConfig: ObjectConfig<NewAuthor> = {
  favoriteGenres: { type: "value", rules: [required], strictOrder: false },
};
