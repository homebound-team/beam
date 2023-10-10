import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { within } from "@storybook/testing-library";
import { useState } from "react";
import { Css } from "src/Css";
import { Value } from "src/inputs/index";
import { TreeSelectField, TreeSelectFieldProps } from "src/inputs/TreeSelectField/TreeSelectField";
import { NestedOption } from "src/inputs/TreeSelectField/utils";
import { HasIdAndName } from "src/types";
import { zeroTo } from "src/utils/sb";

export default {
  component: TreeSelectField,
} as Meta<TreeSelectFieldProps<HasIdAndName, string>>;

function Template(args: TreeSelectFieldProps<HasIdAndName, string>) {
  const options: NestedOption<HasIdAndName>[] = zeroTo(10).map((dIdx) => ({
    id: `d:${dIdx}`,
    name: `Development ${dIdx}`,
    children: zeroTo(5).map((cIdx) => ({
      id: `c:${cIdx}:d:${dIdx}`,
      name: `Cohort ${cIdx}`,
      children: zeroTo(40).map((pIdx) => ({
        id: `p:${pIdx}:c:${cIdx}:d:${dIdx}`,
        name: `Project ${pIdx}`,
      })),
    })),
  }));

  const singleValueId = [options[0]!.children![0]!.children![0].id];
  const multipleValueIds = [...singleValueId, options[0]!.children![0].children![1].id];

  return (
    <div css={Css.df.fdc.gap5.p2.if(args.contrast === true).white.bgGray800.$}>
      <div css={Css.df.fdc.gap3.$}>
        <TestTreeSelectField
          {...args}
          values={["c:1:d:0"]}
          options={options}
          placeholder="Select a project"
          label="Single option selected"
        />

        <TestTreeSelectField
          {...args}
          values={multipleValueIds}
          options={options}
          placeholder="Select a project"
          label="Multiple options selected"
        />

        <TestTreeSelectField
          {...args}
          values={[]}
          options={options}
          placeholder="Select a project"
          label="No options selected"
        />

        <TestTreeSelectField
          {...args}
          disabled="Disabled reason tooltip text"
          label="Disabled"
          values={singleValueId}
          options={options}
        />

        <TestTreeSelectField
          {...args}
          readOnly="Read-only reason tooltip text"
          label="Read-only"
          values={singleValueId}
          options={options}
        />

        <TestTreeSelectField
          {...args}
          label="With error message"
          values={singleValueId}
          options={options}
          errorMsg="This is an error message"
        />

        <TestTreeSelectField
          {...args}
          label="With helper text"
          values={singleValueId}
          options={options}
          helperText="This is the helper text that gives more context to this field"
        />

        <div css={Css.df.fdc.gap4.$}>
          <h2 css={Css.lgMd.$}>Other Label Styles</h2>
          <TestTreeSelectField
            {...args}
            values={multipleValueIds}
            labelStyle="inline"
            options={options}
            label="Inline label"
          />

          <div css={Css.maxwPx(550).$}>
            <TestTreeSelectField
              {...args}
              values={multipleValueIds}
              labelStyle="left"
              options={options}
              label="Left label"
            />
          </div>

          <div css={Css.maxwPx(550).$}>
            <TestTreeSelectField
              {...args}
              values={[]}
              labelStyle="hidden"
              options={options}
              label="Hidden label"
              placeholder="Hidden label"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const Regular = Template.bind({});
export const Compact = Template.bind({});
// @ts-ignore
Compact.args = { compact: true };
export const Contrast = Template.bind({});
// @ts-ignore
Contrast.args = { compact: true, contrast: true };

export function OpenMenu() {
  const options: NestedOption<HasIdAndName>[] = zeroTo(3).map((dIdx) => ({
    id: `d:${dIdx}`,
    name: `Development ${dIdx}`,
    children: zeroTo(2).map((cIdx) => ({
      id: `c:${cIdx}:d:${dIdx}`,
      name: `Cohort ${cIdx}`,
      children: zeroTo(2).map((pIdx) => ({
        id: `p:${pIdx}:c:${cIdx}:d:${dIdx}`,
        name: `Project ${pIdx}`,
      })),
    })),
  }));

  return <TestTreeSelectField values={[]} options={options} label="Nested options" placeholder="Select a project" />;
}
OpenMenu.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  canvas.getByTestId("toggleListBox").click();
};

export function AsyncOptions() {
  const options: NestedOption<HasIdAndName>[] = [
    {
      id: "baseball",
      name: "Baseball",
      children: [
        { id: "mlb", name: "MLB" },
        { id: "milb", name: "Minor League Baseball" },
      ],
    },
    {
      id: "basketball",
      name: "Basketball",
      children: [
        { id: "nba", name: "NBA" },
        { id: "wnba", name: "WNBA" },
      ],
    },
    {
      id: "football",
      name: "Football",
      children: [
        { id: "nfl", name: "NFL" },
        { id: "xfl", name: "XFL" },
      ],
    },
  ];
  const initialOption = [options[0]];

  return (
    <TestTreeSelectField
      values={[]}
      options={{
        current: initialOption,
        load: async () => {
          return new Promise((resolve) => {
            // @ts-ignore - believes `options` should be of type `never[]`
            setTimeout(() => resolve({ options }), 1500);
          });
        },
      }}
      label="Favorite League"
      placeholder="Select a league"
    />
  );
}

function TestTreeSelectField<T extends HasIdAndName, V extends Value>(
  props: Omit<TreeSelectFieldProps<T, V>, "onSelect" | "getOptionValue" | "getOptionLabel">,
): JSX.Element {
  const [selectedOptions, setSelectedOptions] = useState<V[] | undefined>(props.values);
  return (
    <TreeSelectField<T, V>
      {...(props as any)}
      values={selectedOptions}
      onSelect={setSelectedOptions}
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
      getOptionLabel={(o) => o.name}
      getOptionValue={(o) => o.id}
    />
  );
}
