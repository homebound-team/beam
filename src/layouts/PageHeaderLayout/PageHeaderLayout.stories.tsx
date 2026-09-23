import type { Meta } from "@storybook/react-vite";
import { Button } from "src/components/Button";
import { Css } from "src/Css";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { pageContentPaddingX } from "src/layouts/layoutSpacing";
import { NavbarLayout } from "src/layouts/NavbarLayout/NavbarLayout";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { createNavbar, GridTableLayoutExample, sideNavItems } from "src/utils/sbComponents";

export default {
  component: PageHeaderLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: { layout: "fullscreen" },
} as Meta;

/** The header auto-hides on scroll-down and reveals on scroll-up (tall body to demonstrate). */
export function Default() {
  return (
    <PageHeaderLayout pageHeader={{ title: "Page title", rightSlot: <Button label="Action" onClick={() => {}} /> }}>
      <Body />
    </PageHeaderLayout>
  );
}

/** Banner stays pinned when the page header auto-hides on scroll-down. */
export function WithBanner() {
  return (
    <PageHeaderLayout
      pageHeader={{ title: "Page title", rightSlot: <Button label="Action" onClick={() => {}} /> }}
      banner={{
        type: "warning",
        message: "Calculating Updated Costs — Costs shown may be out of date.",
      }}
    >
      <Body />
    </PageHeaderLayout>
  );
}

/**
 * Full chrome stack: env banner + navbar + side nav + page header + page banner, over a document-scroll
 * table. Click a row to open the right pane; the table's sticky header sits below the whole stack.
 */
export function ComposedWithBanner() {
  return (
    <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>
      <NavbarLayout navbar={createNavbar()}>
        <SideNavLayout sideNav={{ items: sideNavItems() }}>
          <PageHeaderLayout
            pageHeader={{ title: "Projects", rightSlot: <Button label="Action" onClick={() => {}} /> }}
            banner={{
              type: "warning",
              message: "Calculating Updated Costs — Costs shown may be out of date.",
            }}
          >
            <GridTableLayoutExample storageKey="page-header-layout-composed-with-banner" withRightPane />
          </PageHeaderLayout>
        </SideNavLayout>
      </NavbarLayout>
    </EnvironmentBannerLayout>
  );
}

function Body() {
  return (
    <div css={{ ...pageContentPaddingX, ...Css.py2.$ }}>
      {zeroTo(30).map((i) => (
        <p key={i} css={Css.mb3.$}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Section {i + 1}.
        </p>
      ))}
    </div>
  );
}
