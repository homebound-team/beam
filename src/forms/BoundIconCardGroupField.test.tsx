import { IconCardGroupItemOption } from "src/inputs/IconCardGroup";
import { AuthorInput } from "./formStateDomain";
import { ObjectConfig, ObjectState, createObjectState, required } from "@homebound/form-state";
import { BoundIconCardGroupField } from "./BoundIconCardGroupField";
import { click, render } from "src/utils/rtl";

const categories: IconCardGroupItemOption[] = [
  { icon: "abacus", label: "Math", value: "math" },
  { icon: "archive", label: "History", value: "history" },
  { icon: "dollar", label: "Finance", value: "finance" },
  { icon: "hardHat", label: "Engineering", value: "engineering" },
  { icon: "kanban", label: "Management", value: "management" },
  { icon: "camera", label: "Media", value: "media" },
];

describe("BoundIconCardGroupField", () => {
  it("shows the label", async () => {
    const author = createObjectState(formConfig, { favoriteGenres: ["math"] });
    const r = await render(<BoundIconCardGroupField field={author.favoriteGenres} options={categories} />);
    expect(r.favoriteGenres_label).toHaveTextContent("Favorite Genres");
  });
  it("triggers 'maybeAutoSave' on change", async () => {
    const autoSave = jest.fn();
    // Given a BoundIconCardGroupField with auto save
    const author: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      {},
      { maybeAutoSave: () => autoSave(author.favoriteGenres.value) },
    );
    const r = await render(<BoundIconCardGroupField field={author.favoriteGenres} options={categories} />);

    // When toggling the checkbox off
    click(r.favoriteGenres_math);
    // Then the callback should be triggered with the current value
    expect(autoSave).toBeCalledWith(["math"]);
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  favoriteGenres: { type: "value", rules: [required], strictOrder: false },
};
