import { ObjectConfig, required, useFormState } from "@homebound/form-state";
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
    fireEvent.focus(r.type());
    click(r.getByRole("option", { name: "Task" }));
    type(r.name, "Test Task Name");

    // Then the values should update
    expect(r.type()).toHaveValue("Task");
    expect(r.typeValue().textContent).toBe("TASK");

    expect(r.name()).toHaveValue("Test Task Name");
    expect(r.nameValue().textContent).toBe("Test Task Name");
  });
});

function TestComponent() {
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
        compact
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
