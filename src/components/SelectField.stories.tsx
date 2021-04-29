import { Meta } from "@storybook/react";
import { useState } from "react";
import { Icon, Icons, SelectField, SelectFieldProps } from "src/components";
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
          selectedOption={options[2]}
          options={options}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
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
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
          fieldDecoration={(o) => o.icon && <Icon icon={o.icon} />}
          selectedOption={options[1]}
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
          label="Favorite Icon - Disabled"
          options={options}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
          disabled
        />
        <TestSelectField
          label="Favorite Icon - Read Only"
          options={options}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
          selectedOption={options[2]}
          readOnly
        />
        <TestSelectField
          label="Favorite Icon"
          options={options}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
        />
      </div>

      <div css={Css.df.flexColumn.childGap3.$}>
        <h1 css={Css.lg.mb2.$}>Compact</h1>
        <TestSelectField
          compact
          label="Favorite Icon"
          selectedOption={options[2]}
          options={options}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
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
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
          fieldDecoration={(o) => o.icon && <Icon icon={o.icon} />}
          selectedOption={options[1]}
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
          label="Favorite Icon - Disabled"
          options={options}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
          disabled
        />
        <TestSelectField
          compact
          label="Favorite Icon - Read Only"
          options={options}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
          selectedOption={options[2]}
          readOnly
        />
        <TestSelectField
          compact
          label="Favorite Icon"
          options={options}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => o.name}
        />
      </div>
    </div>
  );
}

function TestSelectField<T extends object>(
  props: Partial<SelectFieldProps<T>> & Pick<SelectFieldProps<T>, "getOptionLabel" | "getOptionValue" | "options">,
) {
  const [selectedOption, setSelectedOption] = useState<T | undefined>(props.selectedOption);
  return (
    <SelectField
      {...props}
      selectedOption={selectedOption}
      onSelect={(o) => setSelectedOption(o)}
      errorMsg={selectedOption || props.disabled ? "" : "Select an option. Plus more error text to force it to wrap."}
    />
  );
}
