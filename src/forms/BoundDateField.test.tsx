import { createObjectState, ObjectConfig, ObjectState } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { BoundDateField } from "src/forms/BoundDateField";
import { AuthorInput, jan1, jan2 } from "src/forms/formStateDomain";
import { click } from "src/utils/rtl";

describe("BoundDateField", () => {
  it("trigger onFocus and onBlur callbacks", async () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    // Given a BoundDateField with onFocus and onBlur methods
    const author = createObjectState(formConfig, {});
    const r = await render(<BoundDateField field={author.birthday} onBlur={onBlur} onFocus={onFocus} />);

    // When focus is triggered on a checkbox
    r.birthday().focus();
    // Then the callback should be triggered
    expect(onFocus).toBeCalledTimes(1);

    // When blur is triggered on a checkbox
    r.birthday().blur();
    // Then the callback should be triggered
    expect(onBlur).toBeCalledTimes(1);
  });

  it("triggers 'maybeAutoSave' on change", async () => {
    const autoSave = jest.fn();
    // Given a BoundDateField with auto save
    const author: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      { birthday: jan2 },
      // Using toDateString to remove timezone info to prevent flaky test runs.
      { maybeAutoSave: () => autoSave(author.birthday.value?.toDateString()) },
    );
    const r = await render(<BoundDateField field={author.birthday} />);

    // When triggering the Date Picker
    r.birthday().focus();
    // And when selecting a date - React-Day-Picker uses role="gridcell" for all dates. Choose the first of these, which should be `jan1`
    click(r.queryAllByRole("gridcell")[0]);

    // Then the callback should be triggered with the current value
    expect(autoSave).toBeCalledWith(jan1.toDateString());
  });

  it("triggers 'maybeAutoSave' on enter", async () => {
    const autoSave = jest.fn();
    // Given a BoundDateField with auto save
    const author: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      { birthday: jan2 },
      // Using toDateString to remove timezone info to prevent flaky test runs.
      { maybeAutoSave: () => autoSave(author.birthday.value?.toDateString()) },
    );
    const r = await render(<BoundDateField field={author.birthday} />);

    // When hitting the enter key
    fireEvent.keyDown(r.birthday(), { key: "Enter" });

    // Then the callback should be triggered with the current value
    expect(autoSave).toBeCalledWith(jan2.toDateString());
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  birthday: { type: "value" },
};
