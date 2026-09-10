import type { Meta } from "@storybook/react-vite";
import { Button } from "src/components/Button";
import { Css, Tokens } from "src/Css";
import { CenteredLayout, type CenteredLayoutSize } from "src/layouts/CenteredLayout/CenteredLayout";
import { NavbarLayout } from "src/layouts/NavbarLayout/NavbarLayout";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { newStory, viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { createNavbar, RightPaneCenteredPlaceholderBody, sideNavItems } from "src/utils/sbComponents";

export default {
  component: CenteredLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} as Meta;

export function Large() {
  return (
    <PageHeaderLayout pageHeader={{ title: "Dashboard", rightSlot: <Button label="Action" onClick={() => {}} /> }}>
      <CenteredLayout size="lg">
        <PlaceholderBody />
      </CenteredLayout>
    </PageHeaderLayout>
  );
}

export function Small() {
  return (
    <PageHeaderLayout pageHeader={{ title: "Form", rightSlot: <Button label="Action" onClick={() => {}} /> }}>
      <CenteredLayout size="sm">
        <PlaceholderBody />
      </CenteredLayout>
    </PageHeaderLayout>
  );
}

/** `CenteredLayout withRightPane` under page-header chrome. Toggle shell size and side nav. */
export const WithRightPane = newStory(
  ({ size = "sm", withSideNav = true }: { size: CenteredLayoutSize; withSideNav: boolean }) => {
    const body = (
      <PageHeaderLayout pageHeader={{ title: "Dashboard", rightSlot: <Button label="Action" onClick={() => {}} /> }}>
        <CenteredLayout size={size} withRightPane>
          <RightPaneCenteredPlaceholderBody />
        </CenteredLayout>
      </PageHeaderLayout>
    );

    return (
      <NavbarLayout navbar={createNavbar()}>
        {withSideNav ? <SideNavLayout sideNav={{ items: sideNavItems() }}>{body}</SideNavLayout> : body}
      </NavbarLayout>
    );
  },
  {
    args: { size: "sm", withSideNav: true },
    argTypes: {
      size: { control: { type: "select" }, options: ["sm", "lg"] },
      withSideNav: { control: "boolean" },
    },
    parameters: { controls: { include: ["size", "withSideNav"] } },
  },
);

function PlaceholderBody() {
  return (
    <div css={Css.df.fdc.gap2.py3.$}>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} css={Css.hPx(48).br4.bgColor(Tokens.SurfaceSeparator).$} />
      ))}
    </div>
  );
}
