import { createObjectState, ObjectConfig, ObjectState } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { BoundDateRangeField } from "src/forms/BoundDateRangeField";
import { AuthorInput, jan1, jan19, jan2 } from "src/forms/formStateDomain";
import { blur, click, focus } from "src/utils/rtl";

describe(BoundDateRangeField, () => {
  it("trigger onFocus and onBlur callbacks", async () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    // Given a BoundDateRangeField with onFocus and onBlur methods
    const author = createObjectState(formConfig, {});
    const r = await render(<BoundDateRangeField field={author.saleDates} onBlur={onBlur} onFocus={onFocus} />);

    // When focus is triggered on a checkbox
    focus(r.saleDates);
    // Then the callback should be triggered
    expect(onFocus).toBeCalledTimes(1);

    // When blur is triggered on a checkbox
    blur(r.saleDates);
    // Then the callback should be triggered
    expect(onBlur).toBeCalledTimes(1);
  });

  it("triggers 'maybeAutoSave' on change", async () => {
    const autoSave = jest.fn();
    // Given a BoundDateRangeField with auto save
    const author: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      { saleDates: { from: jan2, to: jan19 } },
      // Using toDateString to remove timezone info to prevent flaky test runs.
      { maybeAutoSave: () => autoSave(author.saleDates.value) },
    );
    const r = await render(<BoundDateRangeField field={author.saleDates} />);

    // When triggering the Date Picker
    focus(r.saleDates);
    // And when selecting a date - Choose the first of these, which should be `jan1`
    click(r.datePickerDay_0);

    // Then the callback should be triggered with the current value
    expect(autoSave).toBeCalledWith({ from: jan1, to: jan19 });
  });

  it("triggers 'maybeAutoSave' on enter", async () => {
    const autoSave = jest.fn();
    // Given a BoundDateRangeField with auto save
    const author: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      { saleDates: { from: jan2, to: jan19 } },
      // Using toDateString to remove timezone info to prevent flaky test runs.
      { maybeAutoSave: () => autoSave(author.saleDates.value) },
    );
    const r = await render(<BoundDateRangeField field={author.saleDates} />);

    // When hitting the enter key
    fireEvent.keyDown(r.saleDates(), { key: "Enter" });

    // Then the callback should be triggered with the current value
    expect(autoSave).toBeCalledWith({ from: jan2, to: jan19 });
  });

  it("reflects readOnly correctly", async () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    // Given a BoundDateRangeField for a field marked as readOnly is rendered
    const author = createObjectState(formConfigReadOnly, {});
    const r = await render(<BoundDateRangeField field={author.saleDates} onBlur={onBlur} onFocus={onFocus} />);

    // Then the field should be disabled
    expect(r.saleDates()).toHaveAttribute("data-readonly", "true");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  saleDates: { type: "value" },
};

const formConfigReadOnly: ObjectConfig<AuthorInput> = {
  saleDates: { type: "value", readOnly: true },
};
