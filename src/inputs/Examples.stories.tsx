import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useEffect } from "react";
import { SuperDrawerContent, useSuperDrawer } from "src/components";
import { SuperDrawerHeader } from "src/components/SuperDrawer/components/SuperDrawerHeader";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { withBeamDecorator } from "src/utils/sb";
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
  return (
    <SuperDrawerContent
      actions={[
        { label: "Cancel", onClick: noop },
        { label: "Save", onClick: noop },
      ]}
    >
      <SuperDrawerHeader>
        <h1>5304.01 - Counters</h1>
      </SuperDrawerHeader>
      <form css={{ ...Css.df.fdc.gap5.$, "& fieldset": Css.df.fdc.gap2.$, "& legend": Css.baseMd.mb2.$ }}>
        <fieldset>
          <legend>Details</legend>
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

        <fieldset>
          <legend>Notes</legend>
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
