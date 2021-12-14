import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { GridColumn, GridTable, Icon, IconKey, simpleHeader, SimpleHeaderAndDataOf } from "src/components";
import { Css } from "src/Css";
import { SelectField, SelectFieldProps } from "src/inputs/SelectField";
import { Value } from "src/inputs/Value";
import { HasIdAndName, Optional } from "src/types";
import { noop } from "src/utils";
import { zeroTo } from "src/utils/sb";

export default {
  component: SelectField,
  title: "Inputs/Select Fields",
  parameters: { layout: "fullscreen" },
  argTypes: {
    compact: { control: false },
    contrast: { control: false },
  },
} as Meta;

type TestOption = {
  id: string;
  name: string;
  icon?: IconKey;
};

const options: TestOption[] = [
  { id: "1", name: "Download", icon: "download" },
  { id: "2", name: "Camera", icon: "camera" },
  { id: "3", name: "Info Circle", icon: "infoCircle" },
  { id: "4", name: "Calendar", icon: "calendar" },
  { id: "5", name: "Dollar dollar bill, ya'll! ".repeat(5), icon: "dollar" },
];

const optionsWithNumericIds: { id: number; name: string }[] = [
  { id: 1, name: "One" },
  { id: 2, name: "Two" },
  { id: 3, name: "Three" },
  { id: 4, name: "Four" },
];

const booleanOptions = [
  { label: "Yes", value: true },
  { label: "No", value: false },
  { label: "Unset", value: undefined },
];

// export function SelectFields() {
function Template(args: SelectFieldProps<any, any>) {
  const loadTestOptions: TestOption[] = zeroTo(1000).map((i) => ({ id: String(i), name: `Project ${i}` }));

  return (
    <div css={Css.df.fdc.childGap5.p2.if(args.contrast === true).white.bgGray800.$}>
      <div css={Css.df.fdc.childGap2.$}>
        <h1 css={Css.lg.$}>{args.compact ? "Compact" : "Regular"}</h1>
        <TestSelectField
          {...args}
          label="Favorite Icon"
          value={options[2].id}
          options={options}
          getOptionMenuLabel={(o) => (
            <div css={Css.df.aic.$}>
              {o.icon && (
                <span css={Css.fs0.mr2.$}>
                  <Icon icon={o.icon} />
                </span>
              )}
              {o.name}
            </div>
          )}
        />
        <TestSelectField
          {...args}
          label="Favorite Icon - with field decoration"
          options={options}
          fieldDecoration={(o) => o.icon && <Icon icon={o.icon} />}
          value={options[1].id}
          getOptionMenuLabel={(o) => (
            <div css={Css.df.aic.$}>
              {o.icon && (
                <span css={Css.fs0.mr2.$}>
                  <Icon icon={o.icon} />
                </span>
              )}
              {o.name}
            </div>
          )}
        />
        <TestSelectField<TestOption, string>
          {...args}
          label="Favorite Icon - Disabled"
          value={undefined}
          options={options}
          disabled="Disabled reason"
        />
        <TestSelectField
          {...args}
          label="Favorite Icon - Read Only"
          options={options}
          value={options[2].id}
          readOnly="Read only reason"
        />
        <TestSelectField<TestOption, string>
          {...args}
          label="Favorite Icon - Invalid"
          value={undefined}
          options={options}
        />
        <TestSelectField
          {...args}
          label="Favorite Icon - Helper Text"
          value={options[0].id}
          options={options}
          helperText="Some really long helper text that we expect to wrap."
        />
        <TestSelectField
          {...args}
          label="Favorite Number - Numeric"
          value={1}
          options={optionsWithNumericIds}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
        />
        <TestSelectField
          {...args}
          label="Is Available - Boolean"
          value={false}
          options={booleanOptions}
          getOptionValue={(o) => o.value}
          getOptionLabel={(o) => o.label}
        />
        <TestSelectField
          {...args}
          label="Has 'unselect' option"
          value={undefined}
          options={[{ id: undefined, name: "No Selection", icon: "x" }, ...options]}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
        />

        <TestSelectField
          {...args}
          label="Inline Label"
          inlineLabel
          value={undefined}
          options={[{ id: undefined, name: "No Selection", icon: "x" }, ...options]}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
        />

        <p>(SelectField with hidden label below)</p>
        <TestSelectField
          {...args}
          label="Hidden Label"
          hideLabel
          value={undefined}
          options={[{ id: undefined, name: "No Selection", icon: "x" }, ...options]}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
        />
      </div>

      <div css={Css.df.fdc.childGap2.$}>
        <h1 css={Css.lg.$}>Load test, 1000 Options</h1>
        <TestSelectField {...args} label="Project" value={loadTestOptions[2].id} options={loadTestOptions} />
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

export function InTable() {
  return (
    <GridTable columns={columns} rows={[simpleHeader, ...rowData.map((r) => ({ kind: "data" as const, ...r }))]} />
  );
}
const people: InternalUser[] = zeroTo(10).map((i) => ({
  id: `iu:${i + 1}`,
  name: `Test user ${i + 1}`.repeat((i % 2) + 1),
}));
const rowData: Request[] = zeroTo(10).map((i) => ({
  id: `r:${i + 1}`,
  user: people[i],
  address: "1234 Address Lane",
  market: "SO Cal",
  homeowner: "John Doe",
}));
const columns: GridColumn<Row>[] = [
  { header: "ID", data: (data) => data.id },
  { header: "Homeowner", data: (data) => data.homeowner },
  { header: "Address", data: (data) => data.address },
  {
    header: "Contact",
    data: (data) => (
      <SelectField
        label="People"
        hideLabel
        getOptionValue={(iu) => iu.id}
        getOptionLabel={(iu) => iu.name}
        value={data.user.id}
        onSelect={noop}
        options={people}
      />
    ),
  },
  { header: "Market", data: (data) => data.market },
];
type Row = SimpleHeaderAndDataOf<Request>;
type InternalUser = { name: string; id: string };
type Request = { id: string; user: InternalUser; address: string; homeowner: string; market: string };

// Kind of annoying but to get type inference for HasIdAndName working, we
// have to re-copy/paste the overload here.
function TestSelectField<T extends object, V extends Value>(
  props: Omit<SelectFieldProps<T, V>, "onSelect">,
): JSX.Element;
function TestSelectField<O extends HasIdAndName<V>, V extends Value>(
  props: Optional<Omit<SelectFieldProps<O, V>, "onSelect">, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
function TestSelectField<T extends object, V extends Value>(
  props: Optional<Omit<SelectFieldProps<T, V>, "onSelect">, "getOptionValue" | "getOptionLabel">,
): JSX.Element {
  const [selectedOption, setSelectedOption] = useState<V | undefined>(props.value);

  return (
    <div css={Css.df.$}>
      <SelectField<T, V>
        // The `as any` is due to something related to https://github.com/emotion-js/emotion/issues/2169
        // We may have to redo the conditional getOptionValue/getOptionLabel
        {...(props as any)}
        value={selectedOption}
        onSelect={setSelectedOption}
        errorMsg={
          selectedOption !== undefined || props.disabled
            ? ""
            : "Select an option. Plus more error text to force it to wrap."
        }
        onBlur={action("onBlur")}
        onFocus={action("onFocus")}
      />
      <div css={Css.m3.$}>value={selectedOption}</div>
    </div>
  );
}
