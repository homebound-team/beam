import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { within } from "@storybook/test";
import { useState } from "react";
import { GridColumn, GridTable, Icon, IconKey, simpleHeader, SimpleHeaderAndData } from "src/components";
import { Css } from "src/Css";
import { SelectField, SelectFieldProps } from "src/inputs/SelectField";
import { Value } from "src/inputs/Value";
import { HasIdAndName, Optional } from "src/types";
import { noop } from "src/utils";
import { withDimensions, zeroTo } from "src/utils/sb";

export default {
  component: SelectField,
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=1287%3A789",
    },
  },
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

const standardOptions: TestOption[] = [
  { id: "1", name: "Download", icon: "download" },
  { id: "2", name: "Camera", icon: "camera" },
  { id: "3", name: "Info Circle", icon: "infoCircle" },
  { id: "4", name: "Calendar", icon: "calendar" },
  { id: "5", name: "Dollar dollar bill, ya'll! ".repeat(5), icon: "dollar" },
];

const coloredOptions: TestOption[] = [
  { id: "1", name: "Download (SUCCESS style palette when selected)", icon: "download" },
  { id: "2", name: "Camera (CAUTION style palette when selected)", icon: "camera" },
  { id: "3", name: "Info Circle (WARNING style palette when selected)", icon: "infoCircle" },
  { id: "4", name: "Calendar (INFO style palette when selected)", icon: "calendar" },
  { id: "5", name: "Dollar dollar bill, ya'll!  (NO EXTRA style palette when selected)", icon: "dollar" },
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

function Template(args: SelectFieldProps<any, any>) {
  const loadTestOptions: TestOption[] = zeroTo(1000).map((i) => ({ id: String(i), name: `Project ${i}` }));
  const options = (args?.options as TestOption[]) ?? standardOptions;

  return (
    <div css={Css.df.fdc.gap5.p2.if(args.contrast === true).white.bgGray800.$}>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>{args.compact ? "Compact" : "Regular"}</h1>
        <TestSelectField
          {...args}
          label="Favorite Icon"
          value={options[2].id}
          options={options}
          unsetLabel="N/A"
          getOptionMenuLabel={(o) => (
            <div css={Css.df.aic.$}>
              {o.icon && (
                <span css={Css.fs0.mr2.$}>
                  <Icon icon={o.icon} />
                </span>
              )}
              {o.name ?? "None"}
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
        <TestSelectField
          {...args}
          label="With Placeholder"
          value={undefined}
          options={options}
          placeholder="Placeholder Content"
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
        <TestSelectField {...args} label="Favorite Icon - Read Only" options={options} value={options[2].id} readOnly />
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
          labelStyle="inline"
          value={undefined}
          options={[{ id: undefined, name: "No Selection", icon: "x" }, ...options]}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
        />
        <p>(SelectField with hidden label below)</p>
        <TestSelectField
          {...args}
          label="Hidden Label"
          labelStyle="hidden"
          value={undefined}
          options={[{ id: undefined, name: "No Selection", icon: "x" }, ...options]}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
        />
        <p>(Omit Error Message)</p>
        <TestSelectField
          {...args}
          label="Hidden Label"
          labelStyle="hidden"
          value={undefined}
          options={[{ id: undefined, name: "No Selection", icon: "x" }, ...options]}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
          hideErrorMessage
        />

        <TestSelectField
          {...args}
          label="Disabled Options"
          value={options[2].id}
          options={options}
          disabledOptions={[options[0].id, { value: options[3].id, reason: "Example disabled tooltip" }]}
          helperText="Disabled options can optionally have tooltip text"
        />

        <TestSelectField {...args} fullWidth label="Full Width" value={options[2].id} options={options} />
      </div>

      <div css={Css.df.fdc.gap2.$}>
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

// @ts-ignore
function getInputStylePalette(v) {
  if (v?.includes(1) || v?.includes("1")) return "success";
  if (v?.includes(2) || v?.includes("2")) return "caution";
  if (v?.includes(3) || v?.includes("3")) return "warning";
  if (v?.includes(4) || v?.includes("4")) return "info";
  return undefined;
}

const standardColoredSelectArgs = {
  options: coloredOptions,
  // @ts-ignore
  getInputStylePalette,
};

export const Colored = Template.bind({});
// @ts-ignore
Colored.args = standardColoredSelectArgs;

export const ColoredContrast = Template.bind({});
// @ts-ignore
ColoredContrast.args = {
  contrast: true,
  ...standardColoredSelectArgs,
};

export const ColoredCompact = Template.bind({});
// @ts-ignore
ColoredCompact.args = {
  compact: true,
  ...standardColoredSelectArgs,
};

const loadTestOptions: TestOption[] = zeroTo(1000).map((i) => ({ id: String(i), name: `Project ${i}` }));

export function PerfTest() {
  const [loaded, setLoaded] = useState<TestOption[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(loadTestOptions[2].id);
  return (
    <SelectField
      label="Project"
      value={selectedValue}
      onSelect={setSelectedValue}
      errorMsg={selectedValue !== undefined ? "" : "Select an option. Plus more error text to force it to wrap."}
      options={{
        current: loadTestOptions[2],
        load: async () => {
          await sleep(1500);
          setLoaded(loadTestOptions);
        },
        options: loaded,
      }}
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}
PerfTest.parameters = { chromatic: { disableSnapshot: true } };

export function LazyLoadStateFields() {
  const [loaded, setLoaded] = useState<TestOption[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(loadTestOptions[2].id);
  return (
    <>
      <SelectField
        label="Project"
        value={selectedValue}
        onSelect={setSelectedValue}
        unsetLabel={"-"}
        options={{
          current: loadTestOptions.find((o) => o.id === selectedValue)!,
          load: async () => {
            await sleep(1500);
            setLoaded(loadTestOptions);
          },
          options: loaded,
        }}
      />
      <SelectField
        label="Project 2 (i.e In a SuperDrawer)"
        value={selectedValue}
        onSelect={setSelectedValue}
        unsetLabel={"-"}
        options={{
          current: loadTestOptions.find((o) => o.id === selectedValue)!,
          load: async () => {
            await sleep(1500);
            setLoaded(loadTestOptions);
          },
          options: loaded,
        }}
      />
    </>
  );
}
LazyLoadStateFields.parameters = { chromatic: { disableSnapshot: true } };

export function LoadingState() {
  const [loaded, setLoaded] = useState<TestOption[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(loadTestOptions[2].id);
  return (
    <SelectField
      label="Project"
      value={selectedValue}
      onSelect={setSelectedValue}
      options={{
        current: loadTestOptions[2],
        load: async () => {
          await sleep(5000);
          setLoaded(loadTestOptions);
        },
        options: loaded,
      }}
    />
  );
}
LoadingState.decorators = [withDimensions()];
LoadingState.parameters = {
  chromatic: { delay: 1000 },
};
LoadingState.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  canvas.getByTestId("project").focus();
  canvas.getByTestId("project").click();
};

export function InTable() {
  return (
    <GridTable
      columns={columns}
      rows={[simpleHeader, ...rowData.map((r) => ({ kind: "data" as const, id: r.id, data: r }))]}
    />
  );
}
const people: InternalUser[] = zeroTo(10).map((i) => ({
  id: `iu:${i + 1}`,
  name: `Test user ${i + 1} `.repeat((i % 5) + 1),
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
        labelStyle="hidden"
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
type Row = SimpleHeaderAndData<Request>;
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
      <div css={Css.m3.$}>value = {`${selectedOption}`}</div>
    </div>
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
