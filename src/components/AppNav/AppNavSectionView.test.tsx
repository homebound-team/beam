import { AppNavSectionView } from "src/components/AppNav/AppNavSectionView";
import type { AppNavSection } from "src/components/AppNav/appNavTypes";
import { render, withRouter } from "src/utils/rtl";

describe("AppNavSectionView", () => {
  it("renders the section label and child items under the section scope", async () => {
    const r = await render(
      <AppNavSectionView section={createSection()} panelCollapsed={false} showDivider={false} />,
      withRouter(),
    );

    expect(r.label).toHaveTextContent("Workspace");
    expect(r.appNav_link_members).toHaveTextContent("Members");
    expect(r.appNav_linkGroup_trigger).toHaveTextContent("Settings");
  });

  it("omits the section label when the section is unlabeled", async () => {
    const r = await render(
      <AppNavSectionView
        section={{ section: true, items: [{ label: "Help", onClick: "/help" }] }}
        panelCollapsed={false}
        showDivider={false}
      />,
      withRouter(),
    );

    expect(r.query.label).toBeNull();
    expect(r.appNav_link_help).toHaveTextContent("Help");
  });

  function createSection(): AppNavSection {
    return {
      section: true,
      label: "Workspace",
      items: [
        { label: "Members", onClick: "/members" },
        {
          label: "Settings",
          items: [
            { label: "General", onClick: "/settings/general" },
            { label: "Billing", onClick: "/settings/billing" },
          ],
        },
      ],
    };
  }
});
