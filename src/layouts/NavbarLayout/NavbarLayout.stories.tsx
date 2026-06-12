import { Meta } from "@storybook/react-vite";
import { Link } from "react-router-dom";
import { AppNavItems } from "src/components/AppNav/AppNavItems";
import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { Button } from "src/components/Button";
import { HomeboundLogo } from "src/components/HomeboundLogo";
import type { NavbarProps, NavbarUser } from "src/components/Navbar/Navbar";
import { Css, Tokens } from "src/Css";
import { NavbarLayout } from "src/layouts/NavbarLayout";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { TableExample } from "src/utils/sbComponents";
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
        <div css={Css.px3.py2.$}>
          <TableExample numCols={20} numRows={100} virtualized />
        </div>
      </PageHeaderLayout>
    </SideNavLayout>
  </NavbarLayout>
);

/** Same as {@link Composed} but without a side nav, so the page header spans from the viewport left edge. */
export const ComposedWithoutSideNav = () => (
  <NavbarLayout navbar={createNavbar()}>
    <PageHeaderLayout pageHeader={{ title: "Page header" }}>
      <div css={Css.px3.py2.$}>
        <TableExample numCols={20} numRows={100} virtualized />
      </div>
    </PageHeaderLayout>
  </NavbarLayout>
);

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
