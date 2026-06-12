import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import {
  SIDE_NAV_LAYOUT_STATE_STORAGE_KEY,
  SideNavLayoutProvider,
} from "src/layouts/SideNavLayout/SideNavLayoutContext";
import { setViewport } from "src/tests/viewport";
import { click, render } from "src/utils/rtl";

const items: AppNavItem[] = [
  { label: "Dashboard", icon: "kanban", onClick: () => {}, active: true },
  { label: "Projects", icon: "search", onClick: () => {} },
];

describe("SideNavLayout", () => {
  it("renders the rail, side nav slot, and page content at desktop", async () => {
    // Given the default desktop viewport
    // When rendered with a sideNav and children
    const r = await render(
      <SideNavLayout sideNav={{ items }}>
        <span>Page content</span>
      </SideNavLayout>,
    );

    // Then the layout root, rail, and slotted SideNav content render
    expect(r.sideNavLayout).toBeInTheDocument();
    expect(r.sideNavLayout_sideNav).toBeInTheDocument();
    expect(r.sideNavLayout_sideNavContent).toHaveTextContent("Dashboard");
    expect(r.getByText("Page content")).toBeInTheDocument();
    expect(r.sideNavLayout_toggle).toBeInTheDocument();
    expect(r.queryByTestId("sideNavLayout_overlay")).toBeNull();
  });

  it("starts collapsed on mobile viewports", async () => {
    // Given a mobile viewport
    setViewport("sm");

    // When rendered
    const r = await render(<SideNavLayout sideNav={{ items }} />);

    // Then the rail starts collapsed
    expect(r.sideNavLayout_toggle).toHaveAttribute("aria-label", "Expand navigation");
    expect(r.sideNavLayout_sideNav).toHaveStyle({ width: "56px" });
  });

  it("ignores stored expanded preference on mobile initial mount", async () => {
    // Given a stored expanded preference on a mobile viewport
    window.localStorage.setItem(SIDE_NAV_LAYOUT_STATE_STORAGE_KEY, "expanded");
    setViewport("sm");

    // When rendered
    const r = await render(<SideNavLayout sideNav={{ items }} />);

    // Then the rail still starts collapsed
    expect(r.sideNavLayout_toggle).toHaveAttribute("aria-label", "Expand navigation");
  });

  it("sizes the mobile rail to full viewport width when expanded", async () => {
    // Given a mobile viewport and an expanded nav state
    setViewport("sm");

    // When rendered inside a provider seeded to expanded
    const r = await render(
      <SideNavLayoutProvider defaultNavState="expanded">
        <SideNavLayout sideNav={{ items }} />
      </SideNavLayoutProvider>,
    );

    // Then the rail fills the viewport via width: 100%
    expect(r.sideNavLayout_sideNav).toHaveStyle({ width: "100%" });
  });

  it("hides the rail when navState is hidden", async () => {
    // Given a hidden nav state
    const r = await render(
      <SideNavLayoutProvider defaultNavState="hidden">
        <SideNavLayout sideNav={{ items }} />
      </SideNavLayoutProvider>,
    );

    // Then the rail and slotted side nav content are absent
    expect(r.queryByTestId("sideNavLayout_sideNav")).toBeNull();
    expect(r.queryByTestId("sideNavLayout_sideNavContent")).toBeNull();
    expect(r.queryByText("Dashboard")).toBeNull();
  });

  it("renders the collapse toggle and flips nav state on click", async () => {
    // Given a layout with the default toggle visible
    const r = await render(<SideNavLayout sideNav={{ items }} />);
    expect(r.sideNavLayout_toggle).toHaveAttribute("aria-label", "Collapse navigation");

    // When the toggle is clicked
    click(r.sideNavLayout_toggle);

    // Then navState moves to collapse
    expect(r.sideNavLayout_toggle).toHaveAttribute("aria-label", "Expand navigation");
  });

  it("omits the toggle when showCollapseToggle is false", async () => {
    // Given showCollapseToggle is false
    // When rendered
    const r = await render(<SideNavLayout sideNav={{ items }} showCollapseToggle={false} />);

    // Then no toggle is rendered (but the rail still is)
    expect(r.queryByTestId("sideNavLayout_toggle")).toBeNull();
    expect(r.sideNavLayout_sideNav).toBeTruthy();
  });

  it("persists toggled navState to localStorage", async () => {
    // Given the default expanded layout
    const r = await render(<SideNavLayout sideNav={{ items }} />);
    expect(r.sideNavLayout_toggle).toHaveAttribute("aria-label", "Collapse navigation");

    // When the user collapses via the toggle
    click(r.sideNavLayout_toggle);

    // Then the choice is written to localStorage
    expect(window.localStorage.getItem(SIDE_NAV_LAYOUT_STATE_STORAGE_KEY)).toBe("collapse");

    // And re-expanding updates storage too
    click(r.sideNavLayout_toggle);
    expect(window.localStorage.getItem(SIDE_NAV_LAYOUT_STATE_STORAGE_KEY)).toBe("expanded");
  });

  it("restores navState from localStorage on mount, overriding defaultNavState", async () => {
    // Given a previously stored collapse choice
    window.localStorage.setItem(SIDE_NAV_LAYOUT_STATE_STORAGE_KEY, "collapse");

    // When the layout mounts with a conflicting defaultNavState
    const r = await render(
      <SideNavLayoutProvider defaultNavState="expanded">
        <SideNavLayout sideNav={{ items }} railWidthPx={300} />
      </SideNavLayoutProvider>,
    );

    // Then the stored value wins
    expect(r.sideNavLayout_toggle).toHaveAttribute("aria-label", "Expand navigation");
  });

  it("does not persist the 'hidden' state (it's programmatic, not a user toggle)", async () => {
    // Given defaultNavState is hidden
    // When the layout mounts
    await render(
      <SideNavLayoutProvider defaultNavState="hidden">
        <SideNavLayout sideNav={{ items }} />
      </SideNavLayoutProvider>,
    );

    // Then nothing is written to localStorage
    expect(window.localStorage.getItem(SIDE_NAV_LAYOUT_STATE_STORAGE_KEY)).toBeNull();
  });
});
