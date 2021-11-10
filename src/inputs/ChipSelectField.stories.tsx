import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { ChipSelectField } from "src";
import { PresentationProvider } from "src/components";
import { TaskStatus } from "src/components/Filters/testDomain";
import { Css } from "src/Css";

export default {
  component: ChipSelectField,
  title: "inputs/ChipSelectField",
} as Meta;

type TaskStatusDetails = { id: string; code: TaskStatus; name: string };

export function Example() {
  const [taskStatuses, setTaskStatuses] = useState<TaskStatusDetails[]>([
    { id: "ts:1", code: TaskStatus.NotStarted, name: "Not Started" },
    { id: "ts:2", code: TaskStatus.InProgress, name: "In Progress" },
    { id: "ts:3", code: TaskStatus.Complete, name: "Complete" },
    { id: "ts:5", code: TaskStatus.OnHold, name: "On Hold" },
    { id: "ts:6", code: TaskStatus.Delayed, name: "Delayed" },
  ]);
  const [value, setValue] = useState<string>(taskStatuses[0].id);

  return (
    <div>
      <h1>Chip SelectField</h1>
      <div css={Css.df.childGap2.$}>
        <ChipSelectField
          label="Test"
          onSelect={(v) => setValue(v)}
          options={taskStatuses}
          value={value}
          onFocus={action("onFocus")}
          onBlur={action("onBlur")}
          placeholder="+ Task Status"
        />
        <ChipSelectField
          label="Test"
          onSelect={(v, o) => setValue(v)}
          options={taskStatuses}
          value={value}
          clearable
          onFocus={action("onFocus")}
          onBlur={action("onBlur")}
          placeholder="+ Task Status"
        />
      </div>

      <h1 css={Css.mt4.$}>Chip SelectField With Presentation typeScale of "xs"</h1>
      <PresentationProvider fieldProps={{ typeScale: "xs" }}>
        <div css={Css.df.childGap2.$}>
          <ChipSelectField
            label="Test"
            onSelect={(v) => setValue(v)}
            options={taskStatuses}
            value={value}
            onFocus={action("onFocus")}
            onBlur={action("onBlur")}
            placeholder="+ Task Status"
          />
          <ChipSelectField
            label="Test"
            onSelect={(v) => setValue(v)}
            options={taskStatuses}
            value={value}
            clearable
            onFocus={action("onFocus")}
            onBlur={action("onBlur")}
            placeholder="+ Task Status"
          />
        </div>
      </PresentationProvider>
    </div>
  );
}
