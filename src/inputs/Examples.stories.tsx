import { Meta } from "@storybook/react-vite";
import { useEffect } from "react";
import { SuperDrawerContent, useSuperDrawer } from "src/components";
import { SuperDrawerHeader } from "src/components/SuperDrawer/components/SuperDrawerHeader";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { withBeamDecorator } from "src/utils/sb";
import { action } from "storybook/actions";
import { SelectField } from "./SelectField";
import { TextAreaField } from "./TextAreaField";
import { TextField } from "./TextField";

export default {
  title: "Inputs/SuperDrawerInputs",
  decorators: [withBeamDecorator],
} as Meta;

export function SuperDrawerWithForm() {
  const { openInDrawer } = useSuperDrawer();

  useEffect(() => {
    openInDrawer({ content: <DrawerWithInputs /> });
  }, [openInDrawer]);

  return null;
}

function DrawerWithInputs() {
  const fieldsetCss = Css.df.fdc.gap2.$;
  const legendCss = Css.md.mb2.$;

  return (
    <SuperDrawerContent
      actions={[
        { label: "Cancel", onClick: noop, variant: "quaternary" },
        { label: "Save", onClick: noop },
      ]}
    >
      <SuperDrawerHeader title="5304.01 - Counters" />
      <form css={Css.df.fdc.gap5.$}>
        <fieldset css={fieldsetCss}>
          <legend css={legendCss}>Details</legend>
          <TextField label="Item Name" value="Counters" onChange={action("TextField - onChange")} />
          <SelectField<Options, number>
            label="Location"
            value={1}
            options={[
              { id: 1, name: "Kitchen" },
              { id: 2, name: "Bathroom" },
            ]}
            onSelect={action("SelectField - onSelect")}
          />
        </fieldset>

        <fieldset css={fieldsetCss}>
          <legend css={legendCss}>Notes</legend>
          <TextAreaField
            label="Specifications (visible to everyone)"
            value="Here's a note for everyone"
            onChange={action("TextAreaField - onChange")}
          />
          <TextAreaField
            label="Trade Note (only visible to trades)"
            value={undefined}
            onChange={action("TextAreaField - onChange")}
          />
          <TextAreaField
            label="Internal Note (only visible to Homebound employees)"
            value={undefined}
            onChange={action("TextAreaField - onChange")}
          />
        </fieldset>
      </form>
    </SuperDrawerContent>
  );
}

type Options = {
  id: number;
  name: string;
};
