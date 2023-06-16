import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useCallback, useState } from "react";
import { ChipSelectField } from "src";
import { PresentationProvider } from "src/components";
import { InternalUser, TaskStatus } from "src/components/Filters/testDomain";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { zeroTo } from "src/utils/sb";

export default {
  component: ChipSelectField,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=34522%3A101241",
    },
  },
} as Meta;

type TaskStatusDetails = { id: string; code: TaskStatus; name: string };

export function Example() {
  const [taskStatuses, setTaskStatuses] = useState<TaskStatusDetails[]>([
    { id: "ts:1", code: TaskStatus.NotStarted, name: "Not Started" },
    { id: "ts:2", code: TaskStatus.InProgress, name: "In Progress" },
    { id: "ts:3", code: TaskStatus.Complete, name: "Complete" },
    { id: "ts:4", code: TaskStatus.OnHold, name: "On Hold ".repeat(10) },
    { id: "ts:5", code: TaskStatus.Delayed, name: "Delayed" },
  ]);
  const [value, setValue] = useState<string>(taskStatuses[0].id);
  const [value2, setValue2] = useState<string>(taskStatuses[3].id);
  const [createValue, setCreateValue] = useState<string>(taskStatuses[0].id);

  return (
    <div>
      <h1>Chip SelectField</h1>
      <div css={Css.df.gap2.$}>
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
      <div css={Css.wPx(250).$}>
        <h1>Truncation demo</h1>
        <ChipSelectField
          label="Test"
          onSelect={(v) => setValue2(v)}
          options={taskStatuses}
          value={value2}
          clearable
          onFocus={action("onFocus")}
          onBlur={action("onBlur")}
          placeholder="+ Task Status"
        />
      </div>

      <h1 css={Css.mt4.$}>Chip SelectField With Presentation typeScale of "xs"</h1>
      <PresentationProvider fieldProps={{ typeScale: "xs" }}>
        <div css={Css.df.gap2.$}>
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
        <div css={Css.wPx(250).$}>
          <h1>Truncation demo</h1>
          <div>
            <ChipSelectField
              label="Test"
              onSelect={(v) => setValue2(v)}
              options={taskStatuses}
              value={value2}
              clearable
              onFocus={action("onFocus")}
              onBlur={action("onBlur")}
              placeholder="+ Task Status"
            />
          </div>
        </div>
      </PresentationProvider>

      <div css={Css.mt4.wPx(400).$}>
        <h1>Create New Flow</h1>
        <div>
          <ChipSelectField
            clearable
            label="Test"
            placeholder="+ Task Status"
            options={taskStatuses}
            value={createValue}
            onSelect={(v) => setCreateValue(v)}
            onFocus={action("onFocus")}
            onBlur={action("onBlur")}
            onCreateNew={async (name) => {
              const newOpt = { id: `ts:${taskStatuses.length + 1}`, code: TaskStatus.NotStarted, name };
              // Requires user to update their local state.
              setTaskStatuses((prevState) => [...prevState, newOpt]);
              setCreateValue(newOpt.id);
            }}
          />
        </div>
      </div>

      <div css={Css.mt4.wPx(400).$}>
        <h1>Disabled with tooltip</h1>
        <div>
          <ChipSelectField
            disabled="Disabled reason"
            clearable
            label="Test"
            options={taskStatuses}
            value={taskStatuses[0].id}
            onSelect={noop}
          />
        </div>
      </div>
    </div>
  );
}

export function PerfTest() {
  const [internalUsers, setInternalUsers] = useState<InternalUser[]>(
    zeroTo(100).map((i) => ({ id: `iu:${i}`, name: `Internal User ${i}` })),
  );
  const [createValue, setCreateValue] = useState<string>(internalUsers[0].id);
  const onFocus = useCallback(action("onFocus"), []);
  const onBlur = useCallback(action("onBlur"), []);
  return (
    <ChipSelectField
      clearable
      label="Test"
      placeholder="+ User"
      options={internalUsers}
      value={createValue}
      onSelect={(v) => setCreateValue(v)}
      onFocus={onFocus}
      onBlur={onBlur}
      onCreateNew={async (name) => {
        const newOpt = { id: `ts:${internalUsers.length + 1}`, name };
        // Requires user to update their local state.
        setInternalUsers((prevState) => [...prevState, newOpt]);
        setCreateValue(newOpt.id);
      }}
    />
  );
}

PerfTest.parameters = {
  chromatic: { disableSnapshot: true },
};
