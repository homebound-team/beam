import { Meta } from "@storybook/react-vite";
import { Link } from "react-router-dom";
import { AppNavItems } from "src/components/AppNav/AppNavItems";
import type { AppNavGroup, AppNavItem } from "src/components/AppNav/appNavTypes";
import { HomeboundLogo } from "src/components/HomeboundLogo";
import type { NavbarUser } from "src/components/Navbar/Navbar";
import { Navbar } from "src/components/Navbar/Navbar";
import { Tokens } from "src/Css";
import {
  newStory,
  type StoryOptions,
  viewportModes,
  withBeamDecorator,
  withDimensions,
  withRouter,
} from "src/utils/sb";
import { action } from "storybook/actions";
import { userEvent, within } from "storybook/test";

export default {
  component: Navbar,
} as Meta;

const navbarStoryOpts: StoryOptions = {
  decorators: [withBeamDecorator, withRouter(), withDimensions()],
  parameters: {
    layout: "fullscreen",
    chromatic: {
      modes: viewportModes("desktop", "mobile1"),
    },
  },
};

export const Example = newStory(
  () => (
    <Navbar
      brand={createBrand()}
      items={createGlobalNavItems({ activeLabel: "Finances" })}
      rightSlot={createDefaultRightSlot()}
      user={createDefaultUser()}
    />
  ),
  navbarStoryOpts,
);

export const WithOpenNav = newStory(
  () => (
    <Navbar
      brand={createBrand()}
      items={createGlobalNavItems({ activeLabel: "Finances", librariesMenuOpen: true })}
      rightSlot={createDefaultRightSlot()}
      user={createDefaultUser()}
    />
  ),
  {
    ...navbarStoryOpts,
    play: async ({ canvasElement }) => {
      const mobileMenu = within(canvasElement).queryByTestId("navbar_mobileMenu");
      if (mobileMenu) {
        await userEvent.click(mobileMenu);
      }
    },
  },
);

function createBrand() {
  return (
    <Link to="/">
      <HomeboundLogo fill={Tokens.OnSurface} width={5} />
    </Link>
  );
}

function createGlobalNavItems(opts?: { activeLabel?: string; librariesMenuOpen?: boolean }): AppNavItem[] {
  const activeLabel = opts?.activeLabel;
  return [
    { label: "Dashboard", onClick: "/", active: activeLabel === "Dashboard" },
    { label: "Projects", onClick: "/projects", active: activeLabel === "Projects" },
    { label: "Finances", onClick: "/finances", active: activeLabel === "Finances" },
    createLibrariesLinkGroup({ menuOpen: opts?.librariesMenuOpen }),
    { label: "Trades", onClick: "/trades", active: activeLabel === "Trades" },
    { label: "Group Commitments", onClick: "/group-commitments", active: activeLabel === "Group Commitments" },
    { label: "Change Log", onClick: "/change-log", active: activeLabel === "Change Log" },
    { label: "Warranty", onClick: "/warranty", active: activeLabel === "Warranty" },
  ];
}

function createLibrariesLinkGroup(opts?: { menuOpen?: boolean }): AppNavGroup {
  return {
    label: "Libraries",
    defaultExpanded: opts?.menuOpen,
    items: [
      {
        section: true,
        items: [
          { label: "Plans", onClick: "/libraries/plans" },
          { label: "Design Packages", onClick: "/libraries/design-packages" },
          { label: "Product Offerings", onClick: "/libraries/product-offerings" },
        ],
      },
      {
        section: true,
        items: [
          { label: "Options - Legacy", onClick: "/libraries/options-legacy" },
          { label: "Options", onClick: "/libraries/options" },
          { label: "Materials", onClick: "/libraries/materials" },
          { label: "Tasks", onClick: "/libraries/tasks" },
          { label: "Milestones", onClick: "/libraries/milestones" },
        ],
      },
      {
        section: true,
        items: [
          { label: "Bid Items", onClick: "/libraries/bid-items" },
          { label: "Scope Template", onClick: "/libraries/scope-template" },
          { label: "Schedule Template", onClick: "/libraries/schedule-template" },
        ],
      },
    ],
  };
}

function createDefaultRightSlot() {
  const items: AppNavItem[] = [
    { label: "Help", onClick: "/help", icon: "helpCircle", iconOnly: true },
    { label: "Notifications", onClick: "/notifications", icon: "bell", iconOnly: true },
  ];
  return <AppNavItems variant="global" items={items} />;
}

function createDefaultUser(): NavbarUser {
  return {
    name: "Tony Stark",
    picture: "tony-stark.jpg",
    menuItems: [{ label: "Profile", onClick: action("Profile clicked") }],
    persistentItems: [{ label: "Sign out", onClick: action("Sign out clicked") }],
  };
}
