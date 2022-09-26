import { action } from "@storybook/addon-actions";
import { useState } from "react";
import { PresentationProvider } from "src/components";
import { Css } from "src/Css";
import { ChipTextField } from "src/inputs/ChipTextField";

export default {
  component: ChipTextField,
  title: "Workspace/Inputs/ChipTextField",
};

export function Example() {
  const [value, setValue] = useState("Add new");
  const [value2, setValue2] = useState("Add new");
  return (
    <div>
      <h1 css={Css.xl.$}>Default</h1>
      <ChipTextField
        value={value}
        label="Chip Field"
        onChange={setValue}
        onFocus={action("onFocus")}
        onBlur={action("onBlur")}
        required
      />
      <h1 css={Css.mt3.xl.$}>Within PresentationProvider with smaller Font Size set to 'xs'</h1>
      <PresentationProvider fieldProps={{ typeScale: "xs" }}>
        <ChipTextField
          value={value2}
          label="Chip Field"
          onChange={setValue2}
          onFocus={action("onFocus")}
          onBlur={action("onBlur")}
          required
        />
      </PresentationProvider>
    </div>
  );
}
