import { Meta } from "@storybook/react";
import { useState } from "react";
import { Css } from "src/Css";
import { Checkbox, CheckboxGroup, CheckboxGroupProps } from "src/index";

export default {
  component: Checkbox,
  title: "Components/Checkboxes",
} as Meta;

export function Checkboxes() {
  return (
    <div css={Css.dg.gap3.p1.$}>
      <div>
        <h2 css={Css.mb1.$}>Basic Checkboxes</h2>
        <div css={Css.dg.gap1.$}>
          <Checkbox onChange={() => {}} label="Default" />
          <Checkbox onChange={() => {}} selected label="Selected" />
          <Checkbox onChange={() => {}} indeterminate label="Indeterminate" />
          <Checkbox onChange={() => {}} disabled label="Disabled" />
        </div>
      </div>
      <div>
        <h2 css={Css.mb1.$}>Checkbox with Label and Description</h2>
        <div>
          <Checkbox
            onChange={() => {}}
            description="Get notified when someone posts a comment on a posting"
            label="Comments"
          />
        </div>
      </div>
    </div>
  );
}

export function CheckboxGroups() {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  return (
    <div>
      <div css={Css.dg.gap1.$}>
        <h2>Checkbox Group</h2>
        <div css={Css.sm.lightBlue800.mb1.$}>{`Selected values: [ ${selectedValues.join(", ")} ]`}</div>
        <CheckboxGroup
          label="Favorite Chairs"
          onChange={(values) => setSelectedValues(values)}
          values={selectedValues}
          options={[
            {
              value: "lounge",
              label: "Lounge Chair by Eames",
              description:
                "Their iconic Eames Lounge Chair and Ottoman (1956) began with a desire to create a chair with “the warm, receptive look of a well-used first baseman’s mitt.",
            },
            {
              value: "pelican",
              label: "Pelican Chair by Finn Juhl",
              description:
                "It’s shocking to think of Finn Juhl designing this sculptural chair more than 80 years ago, and the Pelican Chair (1940) is still “out there” by today’s standards.",
            },
            {
              value: "shell",
              label: "Shell Chair by Hans Wegner",
              description:
                "Sometimes called the “smiling chair,” Hans Wegner’s Shell Chair (1963) achieves a floating lightness with its wing-like seat and arching curved legs.",
            },
            {
              value: "womb",
              label: "Womb Chair by Eero Saarinen",
              description:
                "When Florence Knoll challenged Eero Saarinen to create a chair that she could curl up in, she found the right candidate for the task.",
            },
            {
              value: "disabled",
              label: "Disabled Option",
              disabled: true,
              description: "This chair cannot be selected.",
            },
          ]}
        />
      </div>

      <div css={Css.dg.gap1.mt2.$}>
        <h2>Error Message</h2>
        <TestCheckboxGroup
          label="Favorite Chairs"
          values={["a"]}
          options={[
            { value: "a", label: "Lounge Chair" },
            { value: "b", label: "Kitchen Chair" },
          ]}
          errorMsg="Required"
        />
      </div>

      <div css={Css.dg.gap1.mt2.$}>
        <h2>Helper Text</h2>
        <TestCheckboxGroup
          label="Favorite Chairs"
          values={["a"]}
          options={[
            { value: "a", label: "Lounge Chair" },
            { value: "b", label: "Kitchen Chair" },
          ]}
          helperText="Some really long helper text that we expect to wrap."
        />
      </div>
    </div>
  );
}

function TestCheckboxGroup(props: Omit<CheckboxGroupProps, "onChange">) {
  const { values, ...others } = props;
  const [selectedValues, setSelectedValues] = useState<string[]>(values);
  return <CheckboxGroup values={selectedValues} onChange={(values) => setSelectedValues(values)} {...others} />;
}
