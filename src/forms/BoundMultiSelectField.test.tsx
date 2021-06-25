import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { BoundMultiSelectField } from "src/forms/BoundMultiSelectField";
import { AuthorInput } from "src/forms/formStateDomain";

const shapes = [
  { id: "sh:1", name: "Triangle" },
  { id: "sh:2", name: "Square" },
  { id: "sh:3", name: "Circle" },
];

describe("BoundMultiSelectField", () => {
  it("shows the current value", async () => {
    const author = createObjectState(formConfig, { favoriteShapes: ["sh:1"] });
    const { favoriteShapes } = await render(<BoundMultiSelectField field={author.favoriteShapes} options={shapes} />);
    expect(favoriteShapes()).toHaveValue("Triangle");
  });

  it("shows the error message", async () => {
    const author = createObjectState(formConfig, {});
    author.favoriteShapes.touched = true;
    const { favoriteShapes_errorMsg } = await render(
      <BoundMultiSelectField field={author.favoriteShapes} options={shapes} />,
    );
    expect(favoriteShapes_errorMsg()).toHaveTextContent("Required");
  });

  it("shows the label", async () => {
    const author = createObjectState(formConfig, { favoriteShapes: ["sh:1"] });
    const { favoriteShapes_label } = await render(
      <BoundMultiSelectField field={author.favoriteShapes} options={shapes} />,
    );
    expect(favoriteShapes_label()).toHaveTextContent("Favorite Shape");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  favoriteShapes: { type: "value", rules: [required] },
};
