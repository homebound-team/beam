import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Key, useState } from "react";
import { GridColumn, GridTable, Icon, Icons, simpleHeader, SimpleHeaderAndDataOf } from "src/components";
import { Css } from "src/Css";
import { SelectField, SelectFieldProps } from "src/inputs";
import { HasIdAndName, Optional } from "src/types";
import { noop } from "src/utils";
import { zeroTo } from "src/utils/sb";

export default {
  component: SelectField,
  title: "Inputs/Select Fields",
} as Meta;

type TestOption = {
  id: Key;
  name: string;
  icon?: keyof typeof Icons;
};

const options: TestOption[] = [
  { id: "1", name: "Download", icon: "download" },
  { id: "2", name: "Camera", icon: "camera" },
  { id: "3", name: "Info Circle", icon: "infoCircle" },
  { id: "4", name: "Calendar", icon: "calendar" },
  { id: "5", name: "Dollar dollar bill, ya'll! ".repeat(5), icon: "dollar" },
];

const optionsWithNumericIds: TestOption[] = [
  { id: 1, name: "One" },
  { id: 2, name: "Two" },
  { id: 3, name: "Three" },
  { id: 4, name: "Four" },
];

export function SelectFields() {
  const loadTestOptions: TestOption[] = zeroTo(1000).map((i) => ({ id: i, name: `Project ${i}` }));

  return (
    <div css={Css.df.flexColumn.childGap5.$}>
      <div css={Css.df.flexColumn.childGap2.$}>
        <h1 css={Css.lg.$}>Regular</h1>
        <TestSelectField
          label="Favorite Icon"
          value={options[2].id}
          options={options}
          getOptionMenuLabel={(o) => (
            <div css={Css.df.itemsCenter.$}>
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
          label="Favorite Icon - with field decoration"
          options={options}
          fieldDecoration={(o) => o.icon && <Icon icon={o.icon} />}
          value={options[1].id}
          getOptionMenuLabel={(o) => (
            <div css={Css.df.itemsCenter.$}>
              {o.icon && (
                <span css={Css.fs0.mr2.$}>
                  <Icon icon={o.icon} />
                </span>
              )}
              {o.name}
            </div>
          )}
        />
        <TestSelectField label="Favorite Icon - Disabled" value={undefined} options={options} disabled />
        <TestSelectField label="Favorite Icon - Read Only" options={options} value={options[2].id} readOnly />
        <TestSelectField label="Favorite Icon - Invalid" value={undefined} options={options} />
        <TestSelectField
          label="Favorite Icon - Helper Text"
          value={options[0].id}
          options={options}
          helperText="Some really long helper text that we expect to wrap."
        />
        <TestSelectField
          label="Favorite Number - Numeric"
          value={1}
          options={optionsWithNumericIds}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
        />
      </div>

      <div css={Css.df.flexColumn.childGap2.$}>
        <h1 css={Css.lg.$}>Compact</h1>
        <TestSelectField
          compact
          label="Favorite Icon"
          value={options[2].id}
          options={options}
          getOptionMenuLabel={(o) => (
            <div css={Css.df.itemsCenter.$}>
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
          compact
          label="Favorite Icon - with field decoration"
          options={options}
          fieldDecoration={(o) => o.icon && <Icon icon={o.icon} />}
          value={options[1].id}
          getOptionMenuLabel={(o) => (
            <div css={Css.df.itemsCenter.$}>
              {o.icon && (
                <span css={Css.fs0.mr2.$}>
                  <Icon icon={o.icon} />
                </span>
              )}
              {o.name}
            </div>
          )}
        />
        <TestSelectField compact label="Favorite Icon - Disabled" value={undefined} options={options} disabled />
        <TestSelectField compact label="Favorite Icon - Read Only" options={options} value={options[2].id} readOnly />
        <TestSelectField compact label="Favorite Icon - Invalid" options={options} value={undefined} />
      </div>
      <div css={Css.df.flexColumn.childGap2.$}>
        <h1 css={Css.lg.$}>Inline Label</h1>
        <TestSelectField inlineLabel label="Favorite Icon" value={options[2].id} options={options} />
        <TestSelectField inlineLabel compact label="Favorite Icon" value={options[2].id} options={options} />
        <TestSelectField
          label="Favorite Icon"
          inlineLabel
          options={options}
          fieldDecoration={(o) => o.icon && <Icon icon={o.icon} />}
          value={options[4].id}
          getOptionMenuLabel={(o) => (
            <div css={Css.df.itemsCenter.$}>
              {o.icon && (
                <span css={Css.fs0.mr2.$}>
                  <Icon icon={o.icon} />
                </span>
              )}
              {o.name}
            </div>
          )}
        />
      </div>
      <div css={Css.df.flexColumn.childGap2.$}>
        <h1 css={Css.lg.$}>Load test, 1000 Options</h1>
        <TestSelectField label="Project" value={loadTestOptions[2].id} options={loadTestOptions} />
      </div>
    </div>
  );
}

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
function TestSelectField<T extends object, V extends Key>(props: Omit<SelectFieldProps<T, V>, "onSelect">): JSX.Element;
function TestSelectField<O extends HasIdAndName<V>, V extends Key>(
  props: Optional<Omit<SelectFieldProps<O, V>, "onSelect">, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
function TestSelectField<T extends object, V extends Key>(
  props: Optional<Omit<SelectFieldProps<T, V>, "onSelect">, "getOptionValue" | "getOptionLabel">,
): JSX.Element {
  const [selectedOption, setSelectedOption] = useState<V | undefined>(props.value);

  return (
    <SelectField<T, V>
      // The `as any` is due to something related to https://github.com/emotion-js/emotion/issues/2169
      // We may have to redo the conditional getOptionValue/getOptionLabel
      {...(props as any)}
      value={selectedOption}
      onSelect={setSelectedOption}
      errorMsg={selectedOption || props.disabled ? "" : "Select an option. Plus more error text to force it to wrap."}
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}
