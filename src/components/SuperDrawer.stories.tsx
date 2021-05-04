import { Meta } from "@storybook/react";
import { useState } from "react";
import { Button, Css } from "src";
import { SuperDrawer as SuperDrawerComponent, SuperDrawerProps } from "./SuperDrawer";

export default {
  title: "Components / Super Drawer",
  component: SuperDrawerComponent,
  args: {
    open: true,
    title: "Title",
  },
  argTypes: {
    childContent: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  parameters: {
    controls: { expanded: true },
    actions: { argTypesRegex: "^on.*" },
  },
} as Meta<SuperDrawerProps>;

export function WithChildContent(args: SuperDrawerProps) {
  const [showChildContent, setShowChildContent] = useState(false);

  return (
    <div>
      <SuperDrawerComponent
        {...args}
        childContent={
          showChildContent && (
            <div css={Css.hPx(500).bgGray100.df.itemsCenter.justifyCenter.$}>
              <h1 css={Css.lg.$}>Child Content</h1>
            </div>
          )
        }
        onChildContentBackClick={() => setShowChildContent(false)}
      >
        <div css={Css.hPx(500).bgGray100.df.itemsCenter.justifyCenter.$}>
          <div css={Css.df.flexColumn.itemsCenter.$}>
            <h1 css={Css.lg.$}>Children</h1>
            <Button onClick={() => setShowChildContent(true)} label="Show Child Content"></Button>
          </div>
        </div>
      </SuperDrawerComponent>
    </div>
  );
}

export function WithNoNavigation(args: SuperDrawerProps) {
  return (
    <SuperDrawerComponent {...args} onPrevClick={undefined} onNextClick={undefined}>
      <Children />
    </SuperDrawerComponent>
  );
}

export function WithErrorContent(args: SuperDrawerProps) {
  return (
    <SuperDrawerComponent {...args} onPrevClick={undefined} onNextClick={undefined} errorContent={<ErrorContent />}>
      <Children />
    </SuperDrawerComponent>
  );
}

const Children = () => (
  <div css={Css.hPx(500).bgGray100.df.itemsCenter.justifyCenter.$}>
    <h1 css={Css.lg.$}>Children</h1>
  </div>
);

const ErrorContent = () => (
  <div css={Css.wPx(400).df.flexColumn.justifyCenter.itemsCenter.tc.$}>
    <p css={Css.lgEm.$}>Are you sure you want to cancel without saving your changes?</p>
    <p css={Css.base.mb1.$}>Any changes you've made so far will be lost.</p>
    <Button label="Continue Editing" />
    <Button variant="tertiary" label="Cancel" />
  </div>
);
