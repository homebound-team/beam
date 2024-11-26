import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import { within } from "@storybook/test";
import { useState } from "react";
import { useFilter } from "react-aria";
import { Css } from "src/Css";
import { Autocomplete, AutocompleteProps } from "src/inputs/Autocomplete";

export default {
  component: Autocomplete,
} as Meta;

export const Example: StoryFn<AutocompleteProps<any>> = Template.bind({});
Example.parameters = { chromatic: { disableSnapshot: true } };

export const FullWidth: StoryFn<AutocompleteProps<any>> = Template.bind({});
FullWidth.args = { fullWidth: true };

export const MenuOpen: StoryFn<AutocompleteProps<any>> = Template.bind({});
MenuOpen.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  canvas.getByTestId("heroes").focus();
};

function Template(props: AutocompleteProps<any>) {
  const { contains } = useFilter({ sensitivity: "base" });
  const [value, setValue] = useState<string>();
  const allOptions = [
    { label: "Iron man", imgSrc: "tony-stark.jpg" },
    { label: "Captain Marvel", imgSrc: "captain-marvel.jpg" },
    { label: "Captain America", imgSrc: "captain-america.jpg" },
    { label: "Thor", imgSrc: "thor.jpg" },
    { label: "Black Widow", imgSrc: "/black-widow.jpg" },
  ];
  const [options, setOptions] = useState(allOptions);
  console.log("props", props);
  return (
    <Autocomplete<TestOption>
      {...props}
      label="Heroes"
      labelStyle="hidden"
      getOptionValue={(o) => o.label}
      getOptionLabel={(o) => o.label}
      disabledOptions={[{ value: "Iron man", reason: "No heroes selected" }, "Thor"]}
      getOptionMenuLabel={(o) => (
        <div css={Css.df.aic.gap1.$}>
          <span css={Css.wPx(24).hPx(24).br100.oh.$}>
            <img src={o.imgSrc} alt={o.label} css={Css.w100.h100.objectCover.$} />
          </span>
          {o.label}
        </div>
      )}
      onSelect={action("onSelect")}
      options={options}
      onInputChange={(value) => {
        setValue(value);
        setOptions(allOptions.filter((o) => contains(o.label, value ?? "")));
      }}
      value={value}
    />
  );
}

type TestOption = {
  label: string;
  imgSrc: string;
};
