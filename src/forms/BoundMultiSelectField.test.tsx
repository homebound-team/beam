import { createObjectState, ObjectConfig, ObjectState, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { BoundMultiSelectField } from "src/forms/BoundMultiSelectField";
import { AuthorInput } from "src/forms/formStateDomain";
import { blur, click, focus } from "src/utils/rtl";

const shapes = [
  { id: "sh:1", name: "Triangle" },
  { id: "sh:2", name: "Square" },
  { id: "sh:3", name: "Circle" },
];

describe("BoundMultiSelectField", () => {
  it("shows the current value and label", async () => {
    const author = createObjectState(formConfig, { favoriteShapes: ["sh:1"] });
    const r = await render(<BoundMultiSelectField field={author.favoriteShapes} options={shapes} />);
    expect(r.favoriteShapes).toHaveValue("Triangle");
    expect(r.favoriteShapes_label).toHaveTextContent("Favorite Shape");
  });

  it("shows the error message", async () => {
    const author = createObjectState(formConfig, {});
    author.favoriteShapes.touched = true;
    const r = await render(<BoundMultiSelectField field={author.favoriteShapes} options={shapes} />);
    expect(r.favoriteShapes_errorMsg).toHaveTextContent("Required");
  });

  it("trigger onFocus and onBlur callbacks", async () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    // Given a BoundMultiSelectField with onFocus and onBlur methods
    const author = createObjectState(formConfig, { favoriteShapes: ["sh:1"] });
    const r = await render(
      <BoundMultiSelectField field={author.favoriteShapes} options={shapes} onBlur={onBlur} onFocus={onFocus} />,
    );

    // When focus is triggered on a checkbox
    focus(r.favoriteShapes);
    // Then the callback should be triggered
    expect(onFocus).toBeCalledTimes(1);

    // When blur is triggered on a checkbox
    blur(r.favoriteShapes);
    // Then the callback should be triggered
    expect(onBlur).toBeCalledTimes(1);
  });

  it("triggers 'maybeAutoSave' on change", async () => {
    const autoSave = jest.fn();
    // Given a BoundMultiSelectField with auto save
    const author: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      { favoriteShapes: ["sh:1"] },
      { maybeAutoSave: () => autoSave(author.favoriteShapes.value) },
    );
    const r = await render(<BoundMultiSelectField field={author.favoriteShapes} options={shapes} />);

    click(r.favoriteShapes);
    click(r.getByRole("option", { name: "Square" }));

    // Then the callback should be triggered with the current value
    expect(autoSave).toBeCalledWith(["sh:1", "sh:2"]);
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  favoriteShapes: { type: "value", rules: [required] },
};
