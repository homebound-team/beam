import { Meta } from "@storybook/react";
import { Key, useState } from "react";
import { HasIdAndName, Icon, Icons, Optional, SelectField, SelectFieldProps } from "src/components";
import { Css } from "src/Css";

export default {
  component: SelectField,
  title: "Components/Select Fields",
} as Meta;

type TestOption = {
  id: string;
  name: string;
  icon: keyof typeof Icons;
};

const options: TestOption[] = [
  { id: "1", name: "Download", icon: "download" },
  { id: "2", name: "Camera", icon: "camera" },
  { id: "3", name: "Info Circle", icon: "infoCircle" },
  { id: "4", name: "Calendar", icon: "calendar" },
];

export function SelectFields() {
  return (
    <div css={Css.df.justifyAround.$}>
      <div css={Css.df.flexColumn.childGap3.$}>
        <h1 css={Css.lg.mb2.$}>Regular</h1>
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
        <TestSelectField label="Favorite Icon" value={undefined} options={options} />
      </div>

      <div css={Css.df.flexColumn.childGap3.$}>
        <h1 css={Css.lg.mb2.$}>Compact</h1>
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
        <TestSelectField compact label="Favorite Icon" options={options} value={undefined} />
      </div>
    </div>
  );
}

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
      onSelect={(v) => setSelectedOption(v)}
      errorMsg={selectedOption || props.disabled ? "" : "Select an option. Plus more error text to force it to wrap."}
    />
  );
}
