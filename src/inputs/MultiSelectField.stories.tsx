import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import type { IconKey } from "src/components";
import { Icon } from "src/components";
import { Css } from "src/Css";
import { MultiSelectField, MultiSelectFieldProps, Value } from "src/inputs";
import { HasIdAndName, Optional } from "src/types";

export default {
  component: MultiSelectField,
  title: "Workspace/Inputs/Multi Select Fields",
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=36053%3A101882",
    },
  },
} as Meta;

type TestOption = {
  id: Value;
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

export function MultiSelectFields() {
  return (
    <div css={Css.df.fdc.gap5.$}>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Regular</h1>
        <TestMultiSelectField
          label="Favorite Icons"
          values={[options[2].id]}
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
        <TestMultiSelectField
          label="Favorite Icon - with field decoration"
          options={options}
          fieldDecoration={(o) => o.icon && <Icon icon={o.icon} />}
          values={[options[1].id]}
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
        <TestMultiSelectField
          label="Icons - Multiple selected"
          options={options}
          fieldDecoration={(o) => o.icon && <Icon icon={o.icon} />}
          values={[options[1].id, options[2].id]}
        />
        <TestMultiSelectField
          label="Icons - none selected (All case)"
          options={options}
          fieldDecoration={(o) => o.icon && <Icon icon={o.icon} />}
          values={[] as Value[]}
        />

        <TestMultiSelectField
          label="With Placeholder"
          options={options}
          placeholder="Placeholder Content"
          fieldDecoration={(o) => o.icon && <Icon icon={o.icon} />}
          values={[] as Value[]}
        />
        <TestMultiSelectField
          label="With Disabled Options"
          options={options}
          values={[] as Value[]}
          disabledOptions={[options[0].id, { value: options[2].id, reason: "Example disabled tooltip" }]}
        />
      </div>

      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Compact</h1>
        <TestMultiSelectField
          compact
          label="Favorite Icons"
          values={[options[2].id]}
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
        <TestMultiSelectField
          compact
          label="Favorite Icon - with field decoration"
          options={options}
          fieldDecoration={(o) => o.icon && <Icon icon={o.icon} />}
          values={[options[1].id]}
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
        <TestMultiSelectField
          compact
          label="Icons - Multiple selected"
          options={options}
          fieldDecoration={(o) => o.icon && <Icon icon={o.icon} />}
          values={[options[1].id, options[2].id]}
        />
        <TestMultiSelectField
          compact
          label="Icons - none selected (All case)"
          options={options}
          fieldDecoration={(o) => o.icon && <Icon icon={o.icon} />}
          values={[] as Value[]}
        />
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Inline Label</h1>
        <TestMultiSelectField inlineLabel label="Favorite Icon" values={[options[2].id]} options={options} />
        <TestMultiSelectField inlineLabel compact label="Favorite Icon" values={[options[2].id]} options={options} />
        <TestMultiSelectField
          label="Favorite Icon"
          inlineLabel
          options={options}
          fieldDecoration={(o) => o.icon && <Icon icon={o.icon} />}
          values={[options[4].id]}
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
      </div>
    </div>
  );
}

// Kind of annoying but to get type inference for HasIdAndName working, we
// have to re-copy/paste the overload here.
function TestMultiSelectField<T extends object, V extends Value>(
  props: Omit<MultiSelectFieldProps<T, V>, "onSelect">,
): JSX.Element;
function TestMultiSelectField<O extends HasIdAndName<V>, V extends Value>(
  props: Optional<Omit<MultiSelectFieldProps<O, V>, "onSelect">, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
function TestMultiSelectField<T extends object, V extends Value>(
  props: Optional<Omit<MultiSelectFieldProps<T, V>, "onSelect">, "getOptionValue" | "getOptionLabel">,
): JSX.Element {
  const [selectedOptions, setSelectedOptions] = useState<V[]>(props.values);
  return (
    <MultiSelectField<T, V>
      // The `as any` is due to something related to https://github.com/emotion-js/emotion/issues/2169
      // We may have to redo the conditional getOptionValue/getOptionLabel
      {...(props as any)}
      values={selectedOptions}
      onSelect={setSelectedOptions}
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}
