import { Meta } from "@storybook/react-vite";
import { Link } from "react-router-dom";
import { AppNavItems } from "src/components/AppNav/AppNavItems";
import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { Button } from "src/components/Button";
import { HomeboundLogo } from "src/components/HomeboundLogo";
import type { NavbarProps, NavbarUser } from "src/components/Navbar/Navbar";
import { Css, Tokens } from "src/Css";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { NavbarLayout } from "src/layouts/NavbarLayout";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { GridTableLayoutExample } from "src/utils/sbComponents";
import { action } from "storybook/actions";

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
      <div css={Css.bgGray50.p3.$}>Body slot — pass a SideNavLayout or PageHeaderLayout here.</div>
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
    <SideNavLayout sideNav={{ items: sideNavItems() }}>
      <PageHeaderLayout pageHeader={{ title: "Page header", rightSlot: <Button label="Action" onClick={() => {}} /> }}>
        <GridTableLayoutExample storageKey="navbar-layout-composed" />
      </PageHeaderLayout>
    </SideNavLayout>
  </NavbarLayout>
);

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

function createNavbar(): NavbarProps {
  return {
    brand: (
      <Link to="/">
        <HomeboundLogo fill={Tokens.OnSurface} width={5} />
      </Link>
    ),
    items: [
      { label: "Dashboard", onClick: "/", active: true },
      { label: "Projects", onClick: "/projects" },
      { label: "Finances", onClick: "/finances" },
      { label: "Warranty", onClick: "/warranty" },
    ],
    rightSlot: (
      <AppNavItems
        variant="global"
        items={[
          { label: "Help", onClick: "/help", icon: "helpCircle", iconOnly: true },
          { label: "Notifications", onClick: "/notifications", icon: "bell", iconOnly: true },
        ]}
      />
    ),
    user: createUser(),
  };
}

function createUser(): NavbarUser {
  return {
    name: "Tony Stark",
    picture: "tony-stark.jpg",
    menuItems: [{ label: "Profile", onClick: action("Profile clicked") }],
    persistentItems: [{ label: "Sign out", onClick: action("Sign out clicked") }],
  };
}

function sideNavItems(): AppNavItem[] {
  return [
    {
      section: true,
      label: "Main",
      items: [
        { label: "Dashboard", icon: "kanban", onClick: "/", active: true },
        { label: "Schedule", icon: "calendar", onClick: "/schedule" },
        { label: "Commitments", icon: "fileBlank", onClick: "/commitments" },
        { label: "Documents", icon: "comment", onClick: "/documents" },
        { label: "Settings", icon: "pencil", onClick: "/settings" },
      ],
    },
  ];
}
