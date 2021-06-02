import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useEffect } from "react";
import { SuperDrawerContent, useSuperDrawer } from "src/components";
import { Css } from "src/Css";
import { withSuperDrawerDecorator } from "src/utils/sb";
import { SelectField } from "./SelectField";
import { TextAreaField } from "./TextAreaField";
import { TextField } from "./TextField";

export default {
  title: "Inputs/Examples",
  decorators: [withSuperDrawerDecorator],
} as Meta;

export function SuperDrawerWithForm() {
  const { openInDrawer } = useSuperDrawer();

  useEffect(() => {
    openInDrawer({ type: "new", title: "5304.01 - Counters", content: <DrawerWithInputs /> });
  }, [openInDrawer]);

  return null;
}

function DrawerWithInputs() {
  return (
    <SuperDrawerContent actions={[{ label: "Cancel" }, { label: "Save" }]}>
      <form
        css={{ ...Css.df.flexColumn.childGap5.$, fieldset: Css.df.flexColumn.childGap2.$, legend: Css.baseEm.mb2.$ }}
      >
        <fieldset>
          <legend>Details</legend>
          <TextField label="Item Name" value="Counters" onChange={action("TextField - onChange")} />
          <SelectField
            label="Locations"
            value={1}
            options={[
              { id: 1, name: "Kitchen" },
              { id: 1, name: "Bathroom" },
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
