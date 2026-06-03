import { AppNavItems } from "src/components/AppNav/AppNavItems";
import { render, withRouter } from "src/utils/rtl";

describe("AppNavItems", () => {
  it("renders links, link groups, and sections", async () => {
    const appNavItems = [
      {
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
      },
    ];
    const r = await render(<AppNavItems items={appNavItems} panelCollapsed={false} />, withRouter());

    expect(r.appNav_section_label).toHaveTextContent("Workspace");
    expect(r.appNav_section_link_members).toHaveTextContent("Members");
    expect(r.appNav_section_linkGroup_trigger).toHaveTextContent("Settings");
    expect(r.appNav_section_linkGroup_link_general).toHaveTextContent("General");
    expect(r.appNav_section_linkGroup_link_billing).toHaveTextContent("Billing");
    expect(r.getByText("Members")).toBeInTheDocument();
  });
});
