import { Meta } from "@storybook/react-vite";
import { Icon } from "src/components";
import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { Button } from "src/components/Button";
import { Css, Tokens } from "src/Css";
import { CenteredLayout, EnvironmentBannerLayout } from "src/layouts";
import { NavbarLayout } from "src/layouts/NavbarLayout";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { newStory, viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { createNavbar, GridTableLayoutExample } from "src/utils/sbComponents";
import { userEvent, within } from "storybook/test";

export default {
  component: NavbarLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} as Meta;

export function Default() {
  return (
    <NavbarLayout navbar={createNavbar()}>
      <div css={Css.bgColor(Tokens.Surface).p3.$}>Body slot — pass a SideNavLayout or PageHeaderLayout here.</div>
    </NavbarLayout>
  );
}

/**
 * The canonical composition: `NavbarLayout` → `SideNavLayout` → `PageHeaderLayout` wrapping a wide
 * table so the **document** scrollbars handle overflow. The navbar and page header auto-hide on
 * scroll-down and reveal on scroll-up; CSS-var coordination keeps the table's sticky header below the
 * navbar + page header and its sticky columns right of the side nav rail.
 */
export const Composed = () => (
  <NavbarLayout navbar={createNavbar()}>
    <SideNavLayout sideNav={{ top: <Brand />, items: sideNavItems() }}>
      <PageHeaderLayout pageHeader={{ title: "Page header", rightSlot: <Button label="Action" onClick={() => {}} /> }}>
        <GridTableLayoutExample storageKey="navbar-layout-composed" />
      </PageHeaderLayout>
    </SideNavLayout>
  </NavbarLayout>
);

/** Mobile: hamburger opens on the mobile sub-nav with Main Menu + close. */
export const ComposedWithOpenSubNav = newStory(Composed, {
  parameters: { chromatic: { modes: viewportModes("mobile1") } },
  play: async ({ canvasElement }) => {
    const mobileMenu = within(canvasElement).queryByTestId("navbar_mobileMenu");
    if (mobileMenu) {
      await userEvent.click(mobileMenu);
    }
  },
});

/**
 * Same as {@link Composed} wrapped in {@link EnvironmentBannerLayout} with a displayed dev environment banner.
 */
export const ComposedWithEnvironmentBanner = () => (
  <EnvironmentBannerLayout environmentBanner={{ env: "dev" }}>
    <NavbarLayout navbar={createNavbar()}>
      <SideNavLayout sideNav={{ items: sideNavItems() }}>
        <PageHeaderLayout
          pageHeader={{ title: "Page header", rightSlot: <Button label="Action" onClick={() => {}} /> }}
        >
          <GridTableLayoutExample storageKey="navbar-layout-composed-with-environment-banner" />
        </PageHeaderLayout>
      </SideNavLayout>
    </NavbarLayout>
  </EnvironmentBannerLayout>
);

/** Same as {@link Composed} but without a side nav, so the page header spans from the viewport left edge. */
export const ComposedWithoutSideNav = () => (
  <NavbarLayout navbar={createNavbar()}>
    <PageHeaderLayout pageHeader={{ title: "Page header" }}>
      <GridTableLayoutExample storageKey="navbar-layout-composed-without-side-nav" />
    </PageHeaderLayout>
  </NavbarLayout>
);

/**
 * `NavbarLayout` → `PageHeaderLayout` → `GridTableLayout` without a side nav. Page title and actions live in
 * `PageHeaderLayout`; filters and search live in `GridTableLayout` (no `pageTitle`). The virtualized table uses
 * document scroll so the navbar and page header auto-hide on scroll-down and the sticky table header pins below them.
 * Layout gutter columns (12px left/right) align table content with page padding.
 */
export function ComposedGridTableWithoutSideNav() {
  return (
    <NavbarLayout navbar={createNavbar()}>
      <PageHeaderLayout
        pageHeader={{
          title: "Projects",
          rightSlot: <Button label="Action" onClick={() => {}} />,
        }}
      >
        <GridTableLayoutExample storageKey="navbar-layout-grid-table" />
      </PageHeaderLayout>
    </NavbarLayout>
  );
}

/**
 * Same as {@link ComposedWithEnvironmentBanner}, but the table sits in a `sm` centered layout.
 * Confirms document-scroll table width (`min(100%, chrome)`) stays within that container instead of
 * expanding past it to the full viewport beside the side nav.
 */
export const ComposedConstrainedWidthTable = () => (
  <EnvironmentBannerLayout environmentBanner={{ env: "dev" }}>
    <NavbarLayout navbar={createNavbar()}>
      <SideNavLayout sideNav={{ items: sideNavItems() }}>
        <PageHeaderLayout
          pageHeader={{ title: "Page header", rightSlot: <Button label="Action" onClick={() => {}} /> }}
        >
          <CenteredLayout size="sm">
            <GridTableLayoutExample storageKey="navbar-layout-composed-constrained" />
          </CenteredLayout>
        </PageHeaderLayout>
      </SideNavLayout>
    </NavbarLayout>
  </EnvironmentBannerLayout>
);

function Brand() {
  return (
    <div css={Css.df.fdc.gap1.$}>
      <div css={Css.br8.bgColor(Tokens.SurfaceSubtle).py1.px2.df.aic.gap1.color(Tokens.OnSurfaceMuted).mr8.$}>
        <span css={Css.fs0.$}>
          <Icon icon="houseFilled" inc={3} />
        </span>
        <span css={Css.smSb.$}>Structure</span>
      </div>
      <h1 css={Css.lg.$}>1092 Beverly Way - Milam</h1>
      <p css={Css.xs.color(Tokens.OnSurfaceMuted).$}>Altadena, CA 91001</p>
    </div>
  );
}

function sideNavItems(): AppNavItem[] {
  return [
    {
      section: true,
      label: "Main",
      items: [
        { label: "Dashboard", icon: "columns", onClick: "/", active: true },
        { label: "Schedule", icon: "calendar", onClick: "/schedule" },
        { label: "Commitments", icon: "fileBlank", onClick: "/commitments" },
        { label: "Documents", icon: "comment", onClick: "/documents" },
        { label: "Settings", icon: "pencil", onClick: "/settings" },
      ],
    },
  ];
}
