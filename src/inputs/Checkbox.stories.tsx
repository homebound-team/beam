import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { Css } from "src/Css";
import { Checkbox, CheckboxGroup, CheckboxGroupProps } from "src/index";

export default {
  component: Checkbox,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=36894%3A102260",
    },
  },
} as Meta;

export function Checkboxes() {
  return (
    <div css={Css.dg.gap3.p1.$}>
      <div>
        <h2 css={Css.mb1.$}>Basic Checkboxes</h2>
        <div css={Css.dg.gap1.$}>
          <Checkbox
            selected={false}
            onChange={action("onChange")}
            onFocus={action("onFocus")}
            onBlur={action("onBlur")}
            label="Default"
          />
          <Checkbox onChange={action("onChange")} selected={true} label="Selected" />
          <Checkbox onChange={action("onChange")} selected="indeterminate" label="Indeterminate" />
          <Checkbox onChange={action("onChange")} selected={false} disabled label="Disabled while unselected" />
          <Checkbox onChange={action("onChange")} selected={true} disabled label="Disabled while selected" />
        </div>
      </div>
      <div>
        <h2 css={Css.mb1.$}>Checkbox with Label and Description</h2>
        <div>
          <Checkbox
            onChange={action("onChange")}
            description="Get notified when someone posts a comment on a posting"
            label="Comments"
            selected={false}
          />
        </div>
      </div>
      <div>
        <h2 css={Css.mb1.$}>Checkbox with error message and helper text</h2>
        <div>
          <Checkbox
            selected={false}
            onChange={action("onChange")}
            description="Get notified when someone posts a comment on a posting"
            label="Comments"
            errorMsg="An error has occurred"
            helperText="This is helper text"
            data-testid="checkbox"
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
        <div css={Css.sm.blue800.mb1.$}>{`Selected values: [ ${selectedValues.join(", ")} ]`}</div>
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
          onBlur={action("onBlur")}
          onFocus={action("onFocus")}
        />
      </div>

      <div css={Css.mt4.dg.gap1.w50.$}>
        <h2>Checkbox Group with a left label</h2>
        <div css={Css.sm.blue800.mb1.$}>{`Selected values: [ ${selectedValues.join(", ")} ]`}</div>
        <CheckboxGroup
          label="Favorite Chairs"
          labelStyle="left"
          onChange={(values) => setSelectedValues(values)}
          values={selectedValues}
          options={[
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
          ]}
          onBlur={action("onBlur")}
          onFocus={action("onFocus")}
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
