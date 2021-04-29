import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { Css } from "..";
import { Button } from "./Button";
import { SuperDrawer as SuperDrawerComponent } from "./SuperDrawer";

export default {
  title: "Components / Super Drawer",
  component: SuperDrawerComponent,
} as Meta;

export function SuperDrawer() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [showChildContent, setShowChildContent] = useState(true);
  return (
    <div>
      <Button label="Open Drawer" onClick={() => setOpenDrawer(true)} />
      <SuperDrawerComponent
        open={openDrawer}
        title="Title"
        onLeftClick={action("onLeftClick")}
        onRightClick={action("onRightClick")}
        onCloseClick={() => setOpenDrawer(false)}
        onCancelClick={() => setShowChildContent(true)}
        onSubmitClick={action("onSubmitClick")}
        secondaryLabel="Show Child"
        primaryDisabled={true}
        childContent={
          showChildContent && (
            <div>
              <h1>This is rendered as a child</h1>
            </div>
          )
        }
        onChildContentBackClick={() => setShowChildContent(false)}
      >
        <div css={Css.hPx(1000).bgGray100.df.itemsCenter.justifyCenter.$}>
          <h1>Single Column</h1>
        </div>
      </SuperDrawerComponent>
    </div>
  );
}
