import { HeaderActions } from "src/components/Headers/HeaderActions";
import { setViewport } from "src/tests/viewport";
import { click, render, withRouter } from "src/utils/rtl";

describe("HeaderActions", () => {
  it("renders actions as Buttons / IconButtons", async () => {
    // Given a HeaderActions with a default action and an icon action
    const r = await render(
      <HeaderActions
        actions={[
          { label: "Add", onClick: () => {} },
          { kind: "icon", icon: "refresh", label: "Refresh", onClick: () => {} },
        ]}
      />,
    );
    // Then both render as real Buttons / IconButtons
    expect(r.add).toBeInTheDocument();
    expect(r.refresh).toBeInTheDocument();
  });

  it("renders a ButtonMenu overflow action", async () => {
    // Given a HeaderActions with a button and a menu action
    const r = await render(
      <HeaderActions
        actions={[
          { label: "Add", onClick: () => {} },
          {
            kind: "menu",
            trigger: { icon: "verticalDots", variant: "outline" },
            items: [
              { label: "Export", onClick: () => {} },
              { label: "Archive", onClick: () => {} },
            ],
          },
        ]}
      />,
      withRouter(),
    );
    // Then the primary button and overflow trigger render, with the menu closed
    expect(r.add).toBeInTheDocument();
    expect(r.verticalDots).toBeInTheDocument();
    expect(r.query.verticalDots_export).toBeNull();
    // When opening the menu
    click(r.verticalDots);
    // Then the menu items are shown
    expect(r.verticalDots_export).toBeInTheDocument();
    expect(r.verticalDots_archive).toBeInTheDocument();
  });

  it("collapses two or more actions into a ButtonMenu at sm when collapseOnSm", async () => {
    // Given collapseOnSm and a mobile viewport
    setViewport("sm");
    const r = await render(
      <HeaderActions
        collapseOnSm
        actions={[
          { label: "Upload", onClick: () => {} },
          { kind: "icon", icon: "refresh", label: "Refresh", onClick: () => {} },
        ]}
      />,
      withRouter(),
    );
    // Then the kebab is shown and the individual buttons are not
    expect(r.verticalDots).toBeInTheDocument();
    expect(r.query.upload).toBeNull();
    expect(r.query.refresh).toBeNull();
    // When opening the menu
    click(r.verticalDots);
    // Then both actions are menu items
    expect(r.verticalDots_upload).toBeInTheDocument();
    expect(r.verticalDots_refresh).toBeInTheDocument();
  });

  it("keeps a default action's icon when collapsed into the ButtonMenu", async () => {
    // Given collapseOnSm, a mobile viewport, and a button action with an icon
    setViewport("sm");
    const r = await render(
      <HeaderActions
        collapseOnSm
        actions={[
          { label: "Upload", onClick: () => {} },
          { variant: "secondary", icon: "refresh", label: "Refresh", onClick: () => {} },
        ]}
      />,
      withRouter(),
    );
    // When opening the collapsed kebab
    click(r.verticalDots);
    // Then the menu item still shows that icon
    expect(r.verticalDots_refresh.querySelector("[data-icon='refresh']")).toBeInTheDocument();
  });

  it("flattens kind:menu items into the collapsed ButtonMenu", async () => {
    // Given collapseOnSm, a mobile viewport, and a nested menu action
    setViewport("sm");
    const r = await render(
      <HeaderActions
        collapseOnSm
        actions={[
          { label: "Upload", onClick: () => {} },
          {
            kind: "menu",
            trigger: { icon: "verticalDots", variant: "outline" },
            items: [{ label: "Archive", onClick: () => {} }],
          },
        ]}
      />,
      withRouter(),
    );
    // When opening the collapsed kebab
    click(r.verticalDots);
    // Then both the button action and the nested menu item are in that one menu
    expect(r.verticalDots_upload).toBeInTheDocument();
    expect(r.verticalDots_archive).toBeInTheDocument();
  });

  it("keeps a single action as a button at sm when collapseOnSm", async () => {
    // Given collapseOnSm, one action, and a mobile viewport
    setViewport("sm");
    const r = await render(<HeaderActions collapseOnSm actions={[{ label: "Upload", onClick: () => {} }]} />);
    // Then it stays a button, with no kebab
    expect(r.upload).toBeInTheDocument();
    expect(r.query.verticalDots).toBeNull();
  });
});
