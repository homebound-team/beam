import { HeaderActions } from "src/components/Headers/HeaderActions";
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
});
