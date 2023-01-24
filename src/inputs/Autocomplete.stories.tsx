import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { useFilter } from "react-aria";
import { Css } from "src/Css";
import { Autocomplete } from "src/inputs/Autocomplete";

export default {
  component: Autocomplete,
} as Meta;

export function Example() {
  const options: TestOption[] = [
    { label: "Iron man", imgSrc: "tony-stark.jpg" },
    { label: "Captain Marvel", imgSrc: "captain-marvel.jpg" },
    { label: "Captain America", imgSrc: "captain-america.jpg" },
    { label: "Thor", imgSrc: "thor.jpg" },
    { label: "Black Widow", imgSrc: "/black-widow.jpg" },
  ];
  const { contains } = useFilter({ sensitivity: "base" });
  const [selected, setSelected] = useState<string>();

  return (
    <Autocomplete<TestOption>
      label="Heroes"
      getOptionValue={(o) => o.label}
      getOptionLabel={(o) => o.label}
      getOptionMenuLabel={(o) => (
        <div css={Css.df.aic.gap1.$}>
          <span css={Css.wPx(24).hPx(24).br100.overflowHidden.$}>
            <img src={o.imgSrc} alt={o.label} />
          </span>
          {o.label}
        </div>
      )}
      onSelect={action("onSelect")}
      onSearch={async (str) => options.filter((o) => contains(o.label, str ?? ""))}
    />
  );
}

type TestOption = {
  label: string;
  imgSrc: string;
};
