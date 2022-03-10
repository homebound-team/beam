import { createObjectState, ObjectConfig, ObjectState, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { BoundRadioGroupField } from "src/forms/BoundRadioGroupField";
import { AuthorInput } from "src/forms/formStateDomain";
import { click } from "src/utils/rtl";

const sports = [
  { value: "s:1", label: "Football" },
  { value: "s:2", label: "Soccer" },
  { value: "s:3", label: "Basketball" },
];

describe("BoundRadioGroupField", () => {
  it("shows the label", async () => {
    const author = createObjectState(formConfig, {});
    const r = await render(<BoundRadioGroupField field={author.favoriteSport} options={sports} />);
    expect(r.favoriteSport_label()).toHaveTextContent("Favorite Sport");
  });

  it("trigger onFocus and onBlur callbacks", async () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    // Given a BoundRadioGroupField with onFocus and onBlur methods
    const author = createObjectState(formConfig, {});
    const r = await render(
      <BoundRadioGroupField field={author.favoriteSport} options={sports} onBlur={onBlur} onFocus={onFocus} />,
    );

    // When focus is triggered on a checkbox
    r.favoriteSport_s1().focus();
    // Then the callback should be triggered
    expect(onFocus).toBeCalledTimes(1);

    // When blur is triggered on a checkbox
    r.favoriteSport_s1().blur();
    // Then the callback should be triggered
    expect(onBlur).toBeCalledTimes(1);
  });

  it("triggers 'maybeAutoSave' on change", async () => {
    const autoSave = jest.fn();
    // Given a BoundRadioGroupField with auto save
    const author: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      { favoriteSport: "s:2" },
      { maybeAutoSave: () => autoSave(author.favoriteSport.value) },
    );
    const r = await render(<BoundRadioGroupField field={author.favoriteSport} options={sports} />);

    click(r.favoriteSport_s3());

    // Then the callback should be triggered with the current value
    expect(autoSave).toBeCalledWith("s:3");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  favoriteSport: { type: "value", rules: [required] },
};
