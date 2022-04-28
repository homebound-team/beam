import { createObjectState, ObjectConfig, ObjectState, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { BoundCheckboxGroupField } from "src/forms";
import { AuthorInput } from "src/forms/formStateDomain";
import { CheckboxGroupItemOption } from "src/inputs";
import { click } from "src/utils/rtl";

const colors: CheckboxGroupItemOption[] = [
  { value: "c:1", label: "Blue" },
  { value: "c:2", label: "Red" },
  { value: "c:3", label: "Green" },
];

describe("BoundCheckboxGroupField", () => {
  it("shows the label", async () => {
    const author = createObjectState(formConfig, {});
    const r = await render(<BoundCheckboxGroupField field={author.favoriteColors} options={colors} />);
    expect(r.favoriteColors_label()).toHaveTextContent("Favorite Colors");
  });

  it("trigger onFocus and onBlur callbacks", async () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    // Given a BoundCheckboxGroupField with onFocus and onBlur methods
    const author = createObjectState(formConfig, {});
    const r = await render(
      <BoundCheckboxGroupField field={author.favoriteColors} options={colors} onBlur={onBlur} onFocus={onFocus} />,
    );

    // When focus is triggered on a checkbox
    r.blue().focus();
    // Then the callback should be triggered
    expect(onFocus).toBeCalledTimes(1);

    // When blur is triggered on a checkbox
    r.blue().blur();
    // Then the callback should be triggered
    expect(onBlur).toBeCalledTimes(1);
  });

  it("triggers 'maybeAutoSave' on change", async () => {
    const autoSave = jest.fn();
    // Given a BoundCheckboxField with auto save
    const author: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      {},
      { maybeAutoSave: () => autoSave(author.favoriteColors.value) },
    );
    const r = await render(<BoundCheckboxGroupField field={author.favoriteColors} options={colors} />);

    // When toggling the checkbox off
    click(r.blue());
    // Then the callback should be triggered with the current value
    expect(autoSave).toBeCalledWith(["c:1"]);
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  favoriteColors: { type: "value", rules: [required] },
};