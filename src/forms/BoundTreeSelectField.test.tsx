import { createObjectState, ObjectState } from "@homebound/form-state";
import { BoundTreeSelectField } from "src/forms/BoundTreeSelectField";
import { formConfig } from "src/forms/FormStateApp";
import { AuthorInput } from "src/forms/formStateDomain";
import { NestedOption } from "src/inputs";
import { HasIdAndName } from "src/types";
import { blur, click, focus, render } from "src/utils/rtl";

describe(BoundTreeSelectField, () => {
  it("shows the current value and label", async () => {
    const author = createObjectState(formConfig, { favoriteGenres: ["g:4"] });
    const r = await render(<BoundTreeSelectField field={author.favoriteGenres} options={genres} />);
    expect(r.favoriteGenres_label()).toHaveTextContent("Favorite Genres");
    expect(r.favoriteGenres()).toHaveValue("Action Comedy");
  });

  it("shows the error message", async () => {
    const author = createObjectState(formConfig, {});
    author.favoriteGenres.touched = true;
    const r = await render(<BoundTreeSelectField field={author.favoriteGenres} options={genres} />);
    expect(r.favoriteGenres_errorMsg()).toHaveTextContent("Required");
  });

  it("trigger onFocus and onBlur callbacks", async () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    // Given a BoundTreeSelectField with onFocus and onBlur methods
    const author = createObjectState(formConfig, { favoriteGenres: ["g:4"] });
    const r = await render(
      <BoundTreeSelectField field={author.favoriteGenres} options={genres} onBlur={onBlur} onFocus={onFocus} />,
    );

    // When focus is triggered on a checkbox
    focus(r.favoriteGenres);
    // Then the callback should be triggered
    expect(onFocus).toBeCalledTimes(1);

    // When blur is triggered on a checkbox
    blur(r.favoriteGenres);
    // Then the callback should be triggered
    expect(onBlur).toBeCalledTimes(1);
  });

  it("triggers 'maybeAutoSave' on change", async () => {
    const autoSave = jest.fn();
    // Given a BoundTreeSelectField with auto save
    const author: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      { favoriteGenres: ["g:4"] },
      { maybeAutoSave: () => autoSave(author.favoriteGenres.value) },
    );
    const r = await render(<BoundTreeSelectField field={author.favoriteGenres} options={genres} />);

    click(r.favoriteGenres);
    click(r.getByRole("option", { name: "Action Adventure Comedy" }));

    expect(autoSave).toBeCalledTimes(1);
    expect(autoSave).toBeCalledWith(["g:4", "g:3", "g:2", "g:1"]);
  });
});

const genres: NestedOption<HasIdAndName>[] = [
  {
    id: "g:1",
    name: "Action",
    children: [
      {
        id: "g:2",
        name: "Action Adventure",
        children: [{ id: "g:3", name: "Action Adventure Comedy" }],
      },
      { id: "g:4", name: "Action Comedy" },
    ],
  },
  { id: "g:5", name: "Comedy", children: [{ id: "g:6", name: "Comedy Drama" }] },
];
