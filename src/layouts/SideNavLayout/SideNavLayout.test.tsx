import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import {
  SIDE_NAV_LAYOUT_STATE_STORAGE_KEY,
  SideNavLayoutProvider,
} from "src/layouts/SideNavLayout/SideNavLayoutContext";
import { click, render } from "src/utils/rtl";

describe("SideNavLayout", () => {
  afterEach(() => {
    // Reset the viewport between tests so mobile/desktop mocks don't leak.
    setViewportWidth(1280);
    // Clear persisted navState so tests don't influence each other.
    window.localStorage.removeItem(SIDE_NAV_LAYOUT_STATE_STORAGE_KEY);
  });

  it("renders the rail, side nav slot, and page content at desktop", async () => {
    // Given a SideNavLayout at a desktop viewport
    setViewportWidth(1280);

    // When rendered with a sideNav and children
    const r = await render(
      <SideNavLayout sideNav={<span>Side nav slot</span>}>
        <span>Page content</span>
      </SideNavLayout>,
    );

    // Then the layout root, rail, and slotted side nav content render
    expect(r.sideNavLayout).toBeInTheDocument();
    expect(r.sideNavLayout_sideNav).toBeInTheDocument();
    expect(r.sideNavLayout_sideNavContent).toHaveTextContent("Side nav slot");
    expect(r.getByText("Page content")).toBeInTheDocument();
    // And the built-in collapse toggle is present
    expect(r.sideNavLayout_toggle).toBeInTheDocument();
    // And the mobile overlay element no longer exists (deleted along with the scrim).
    expect(r.queryByTestId("sideNavLayout_overlay")).toBeNull();
  });

  it("starts collapsed on mobile viewports", async () => {
    setViewportWidth(400);

    const r = await render(<SideNavLayout sideNav={<div>rail</div>} />);

    expect(r.sideNavLayout_toggle).toHaveAttribute("aria-label", "Expand navigation");
    expect(r.sideNavLayout_sideNav).toHaveStyle({ width: "56px" });
  });

  it("ignores stored expanded preference on mobile initial mount", async () => {
    window.localStorage.setItem(SIDE_NAV_LAYOUT_STATE_STORAGE_KEY, "expanded");
    setViewportWidth(400);

    const r = await render(<SideNavLayout sideNav={<div>rail</div>} />);

    expect(r.sideNavLayout_toggle).toHaveAttribute("aria-label", "Expand navigation");
  });

  it("sizes the mobile rail to full viewport width when expanded", async () => {
    // Given a mobile viewport (< 600px)
    setViewportWidth(400);

    const r = await render(
      <SideNavLayoutProvider defaultNavState="expanded">
        <SideNavLayout sideNav={<div>rail</div>} />
      </SideNavLayoutProvider>,
    );

    // Then the rail fills the viewport via width: 100% (no railWidthPx applied).
    expect(r.sideNavLayout_sideNav).toHaveStyle({ width: "100%" });
  });

  it("hides the rail when navState is hidden", async () => {
    // Given a hidden nav state
    const r = await render(
      <SideNavLayoutProvider defaultNavState="hidden">
        <SideNavLayout sideNav={<span>Side nav slot</span>} />
      </SideNavLayoutProvider>,
    );

    // Then the rail and slotted side nav content are absent
    expect(r.queryByTestId("sideNavLayout_sideNav")).toBeNull();
    expect(r.queryByTestId("sideNavLayout_sideNavContent")).toBeNull();
    expect(r.queryByText("Side nav slot")).toBeNull();
  });

  it("does not render the rail when sideNav prop is undefined", async () => {
    // When the layout is rendered without a sideNav prop
    const r = await render(<SideNavLayout>page</SideNavLayout>);

    // Then no rail container, no toggle
    expect(r.queryByTestId("sideNavLayout_sideNav")).toBeNull();
    expect(r.queryByTestId("sideNavLayout_toggle")).toBeNull();
  });

  it("renders the collapse toggle and flips nav state on click", async () => {
    // Given a layout with the default toggle visible
    const r = await render(<SideNavLayout sideNav={<div>rail</div>} />);
    // Initially the toggle reads as "Collapse navigation"
    expect(r.sideNavLayout_toggle).toHaveAttribute("aria-label", "Collapse navigation");

    // When the toggle is clicked
    click(r.sideNavLayout_toggle);

    // Then it flips to "Expand navigation" (proving navState moved to collapse)
    expect(r.sideNavLayout_toggle).toHaveAttribute("aria-label", "Expand navigation");
  });

  it("omits the toggle when showCollapseToggle is false", async () => {
    // When the consumer opts out of the built-in toggle
    const r = await render(<SideNavLayout sideNav={<div>rail</div>} showCollapseToggle={false} />);

    // Then no toggle is rendered (but the rail still is)
    expect(r.queryByTestId("sideNavLayout_toggle")).toBeNull();
    expect(r.sideNavLayout_sideNav).toBeTruthy();
  });

  it("persists toggled navState to localStorage", async () => {
    const r = await render(<SideNavLayout sideNav={<div>rail</div>} />);

    // Initially expanded (default), nothing in storage yet.
    expect(r.sideNavLayout_toggle).toHaveAttribute("aria-label", "Collapse navigation");

    // When the user collapses via the toggle
    click(r.sideNavLayout_toggle);

    // Then the choice is written to localStorage under the documented key.
    expect(window.localStorage.getItem(SIDE_NAV_LAYOUT_STATE_STORAGE_KEY)).toBe("collapse");

    // And re-expanding flips the stored value too.
    click(r.sideNavLayout_toggle);
    expect(window.localStorage.getItem(SIDE_NAV_LAYOUT_STATE_STORAGE_KEY)).toBe("expanded");
  });

  it("restores navState from localStorage on mount, overriding defaultNavState", async () => {
    // Given a previously stored "collapse" choice
    window.localStorage.setItem(SIDE_NAV_LAYOUT_STATE_STORAGE_KEY, "collapse");

    // When the layout mounts with a conflicting defaultNavState
    const r = await render(
      <SideNavLayoutProvider defaultNavState="expanded">
        <SideNavLayout sideNav={<div>rail</div>} railWidthPx={300} />
      </SideNavLayoutProvider>,
    );

    // Then the stored value wins — the rail starts collapsed
    expect(r.sideNavLayout_toggle).toHaveAttribute("aria-label", "Expand navigation");
  });

  it("does not persist the 'hidden' state (it's programmatic, not a user toggle)", async () => {
    await render(
      <SideNavLayoutProvider defaultNavState="hidden">
        <SideNavLayout sideNav={<div>rail</div>} />
      </SideNavLayoutProvider>,
    );

    // Mounting with defaultNavState="hidden" should not write anything to storage.
    expect(window.localStorage.getItem(SIDE_NAV_LAYOUT_STATE_STORAGE_KEY)).toBeNull();
  });
});

// Drive the breakpoint mock by a synthetic viewport width so both `min-width: …`
// and `max-width: …` queries (used by `mdAndUp` / `mdAndDown`) resolve correctly.
function setViewportWidth(widthPx: number) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => {
      const max = /max-width:\s*(\d+)px/.exec(query);
      const min = /min-width:\s*(\d+)px/.exec(query);
      const maxOk = !max || widthPx <= parseInt(max[1], 10);
      const minOk = !min || widthPx >= parseInt(min[1], 10);
      return {
        matches: maxOk && minOk,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      };
    },
  });
}
