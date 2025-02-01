import { createObjectState, ObjectConfig, ObjectState } from "@homebound/form-state";
import { jest } from "@jest/globals";
import { act, fireEvent } from "@testing-library/react";
import { BoundDateField } from "src/forms/BoundDateField";
import { AuthorInput, jan1, jan2 } from "src/forms/formStateDomain";
import { blur, click, focus, render } from "src/utils/rtl";

describe("BoundDateField", () => {
  it("trigger onFocus and onBlur callbacks", async () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    // Given a BoundDateField with onFocus and onBlur methods
    const author = createObjectState(formConfig, {});
    const r = await render(<BoundDateField field={author.birthday} onBlur={onBlur} onFocus={onFocus} />);

    // When setting focus on the input element
    focus(r.birthday);
    // And clicking the input element to trigger the date picker
    click(r.birthday);
    // Then the callback should be triggered
    expect(onFocus).toBeCalledTimes(1);

    // When closing the overlay and putting focus back on the input
    fireEvent.keyDown(r.birthday_datePicker, { key: "Escape", code: "Escape" });
    expect(onBlur).toBeCalledTimes(0);

    // When blur is triggered
    blur(r.birthday);
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

    // When clicking input element to trigger the date picker
    click(r.birthday);
    // And when selecting a date - Choose the first of these, which should be `jan1`
    click(r.datePickerDay_0);

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
    fireEvent.keyDown(r.birthday, { key: "Enter" });

    // Then the callback should be triggered with the current value
    expect(autoSave).toBeCalledWith(jan2.toDateString());
  });

  it("respects form state's readonly property", async () => {
    const autoSave = jest.fn();
    // Given a BoundDateField
    const author: ObjectState<AuthorInput> = createObjectState(formConfig, { birthday: jan2 });
    const r = await render(<BoundDateField field={author.birthday} />);
    // When setting the form state to readOnly
    act(() => {
      author.readOnly = true;
    });

    // Then the field should be read only
    expect(r.birthday).toHaveAttribute("data-readonly", "true");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  birthday: { type: "value" },
};
