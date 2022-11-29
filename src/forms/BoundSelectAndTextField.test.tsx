import { createObjectState, ObjectConfig, required, useFormState } from "@homebound/form-state";
import { click } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { Observer } from "mobx-react";
import { BoundSelectAndTextField } from "src";
import { ScheduleTypes } from "src/components/Filters/testDomain";
import { render, type } from "src/utils/rtl";

describe("BoundSelectAndTextField", () => {
  it("renders and updates values", async () => {
    // Given a BoundSelectAndTextField
    const r = await render(<TestComponent />);

    // Then it is initially empty
    expect(r.type()).not.toHaveValue();
    expect(r.typeValue()).toBeEmptyDOMElement();

    expect(r.name()).not.toHaveValue();
    expect(r.nameValue()).toBeEmptyDOMElement();

    // When changing the values
    fireEvent.click(r.type());
    click(r.getByRole("option", { name: "Task" }));
    type(r.name, "Test Task Name");

    // Then the values should update
    expect(r.type()).toHaveValue("Task");
    expect(r.typeValue().textContent).toBe("TASK");

    expect(r.name()).toHaveValue("Test Task Name");
    expect(r.nameValue().textContent).toBe("Test Task Name");
  });

  it("can set custom testid", async () => {
    // Given a BoundSelectAndTextField with a custom testid
    const r = await render(<TestComponent data-testid="custom" />);

    // Then expect it to prefix the default field testids
    expect(r.custom_type()).toBeTruthy();
    expect(r.custom_name()).toBeTruthy();
  });

  it("can fire onBlur and onFocus for fields", async () => {
    const selectOnBlur = jest.fn();
    const selectOnFocus = jest.fn();
    const textOnBlur = jest.fn();
    const textOnFocus = jest.fn();
    // Given a BoundSelectAndTextField with the onBlur and onFocus callbacks and autoSave
    const formState = createObjectState(config, {});
    const types = [
      { id: ScheduleTypes.Task, name: "Task" },
      { id: ScheduleTypes.Milestone, name: "Milestone" },
    ];
    const r = await render(
      <BoundSelectAndTextField
        selectFieldProps={{ field: formState.type, options: types, onBlur: selectOnBlur, onFocus: selectOnFocus }}
        textFieldProps={{ field: formState.name, onBlur: textOnBlur, onFocus: textOnFocus }}
      />,
    );

    // When firing the focus and blur events on both fields
    fireEvent.focus(r.type());
    fireEvent.blur(r.type());
    fireEvent.focus(r.name());
    fireEvent.blur(r.name());

    // Then the callback functions should each have been fired.
    expect(selectOnFocus).toBeCalledTimes(1);
    expect(selectOnBlur).toBeCalledTimes(1);
    expect(textOnFocus).toBeCalledTimes(1);
    expect(textOnBlur).toBeCalledTimes(1);
  });

  it("can fire auto save on select field change and text field enter", async () => {
    const maybeAutoSave = jest.fn();
    // Given a BoundSelectAndTextField with autoSave
    const formState = createObjectState(config, {}, { maybeAutoSave });
    const types = [
      { id: ScheduleTypes.Task, name: "Task" },
      { id: ScheduleTypes.Milestone, name: "Milestone" },
    ];
    const r = await render(
      <BoundSelectAndTextField
        selectFieldProps={{ field: formState.type, options: types }}
        textFieldProps={{ field: formState.name }}
      />,
    );

    // When making a selection from the dropdown
    r.type().click();
    click(r.getByRole("option", { name: "Task" }));
    // Then autoSave should be called.
    expect(maybeAutoSave).toBeCalledTimes(1);

    // And when using the "Enter" key on the text field
    fireEvent.keyDown(r.name(), { key: "Enter" });
    // Then autoSave should be called.
    expect(maybeAutoSave).toBeCalledTimes(2);
  });
});

function TestComponent(props: any) {
  const formState = useFormState({ config });
  const types = [
    { id: ScheduleTypes.Task, name: "Task" },
    { id: ScheduleTypes.Milestone, name: "Milestone" },
  ];

  return (
    <>
      <BoundSelectAndTextField
        selectFieldProps={{ field: formState.type, options: types }}
        textFieldProps={{ field: formState.name, clearable: true, placeholder: "Add new" }}
        {...props}
      />
      <Observer>
        {() => (
          <>
            <div data-testid="typeValue">{formState.type.value}</div>
            <div data-testid="nameValue">{formState.name.value}</div>
          </>
        )}
      </Observer>
    </>
  );
}

type AddNewInput = {
  type?: string | null;
  name?: string | null;
};

const config: ObjectConfig<AddNewInput> = {
  type: { type: "value", rules: [required] },
  name: { type: "value", rules: [required] },
};
