import { ObjectConfig, required, useFormState } from "@homebound/form-state";
import { Meta } from "@storybook/react";
import { Observer } from "mobx-react";
import { BoundSelectAndTextField } from "src";
import { ScheduleTypes } from "src/components/Filters/testDomain";
import { Css } from "src/Css";

export default {
  component: BoundSelectAndTextField,
  title: "Workspace/Inputs/BoundSelectAndTextField",
} as Meta;

export function Example() {
  const formState = useFormState({ config, init: { type: ScheduleTypes.Task } });
  const types = [
    { id: ScheduleTypes.Task, name: "Task" },
    { id: ScheduleTypes.Milestone, name: "Milestone" },
  ];

  return (
    <>
      <BoundSelectAndTextField
        selectFieldProps={{ field: formState.type, options: types }}
        textFieldProps={{ field: formState.name, clearable: true, placeholder: "Add new" }}
      />
      <Observer>
        {() => (
          <div css={Css.df.fdc.gap1.mt2.$}>
            <div>
              <strong>Valid:</strong> {JSON.stringify(formState.valid)}
            </div>
            <div>
              <strong>Form values:</strong>
              <pre>{JSON.stringify(formState.value, null, 2)}</pre>
            </div>
          </div>
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
