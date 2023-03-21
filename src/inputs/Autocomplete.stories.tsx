import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import { within } from "@storybook/testing-library";
import { useState } from "react";
import { useFilter } from "react-aria";
import { Css } from "src/Css";
import { Autocomplete } from "src/inputs/Autocomplete";

export default {
  component: Autocomplete,
} as Meta;

export const Example: StoryFn = Template.bind({});
Example.parameters = { chromatic: { disableSnapshot: true } };

export const MenuOpen: StoryFn = Template.bind({});
MenuOpen.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  canvas.getByTestId("heroes").focus();
};

function Template() {
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

  return (
    <Autocomplete<TestOption>
      label="Heroes"
      labelStyle="hidden"
      getOptionValue={(o) => o.label}
      getOptionLabel={(o) => o.label}
      getOptionMenuLabel={(o) => (
        <div css={Css.df.aic.gap1.$}>
          <span css={Css.wPx(24).hPx(24).br100.overflowHidden.$}>
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
