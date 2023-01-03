import { createObjectState, ObjectConfig, ObjectState, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { AuthorInput } from "src/forms/formStateDomain";
import { click } from "src/utils/rtl";
import { BoundMultiLineSelectField } from "./BoundMultiLineSelectField";

const shapes = [
  { id: "sh:1", name: "Triangle" },
  { id: "sh:2", name: "Square" },
  { id: "sh:3", name: "Circle" },
];

describe("BoundMultiLineSelectField", () => {
  it("shows the current value and label", async () => {
    // Given a BoundMultiSelectField with a selected value
    const author = createObjectState(formConfig, { favoriteShapes: ["sh:1"] });

    // When the component is rendered
    const r = await render(<BoundMultiLineSelectField field={author.favoriteShapes} options={shapes} />);

    // Then it shows the correct value
    expect(r.selectField_0()).toHaveTextContent("Triangle");
    expect(r.addAnother()).toHaveTextContent("Add Another Favorite Shape");
  });

  it("triggers 'maybeAutoSave' on change", async () => {
    const autoSave = jest.fn();
    // Given a BoundMultiSelectField with auto save
    const author: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      { favoriteShapes: ["sh:1"] },
      { maybeAutoSave: () => autoSave(author.favoriteShapes.value) },
    );
    const r = await render(<BoundMultiLineSelectField field={author.favoriteShapes} options={shapes} />);

    // When an option is selected
    click(r.addAnother());
    click(r.selectField_1());
    click(r.getByRole("option", { name: "Square" }));

    // Then the callback should be triggered with the current value
    expect(autoSave).toBeCalledWith(["sh:1", "sh:2"]);
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  favoriteShapes: { type: "value", rules: [required] },
};
