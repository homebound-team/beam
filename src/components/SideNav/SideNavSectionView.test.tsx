import { SideNavSectionView } from "src/components/SideNav/SideNavSectionView";
import type { SideNavSection } from "src/components/SideNav/sideNavTypes";
import { useTestIds } from "src/utils";
import { render, withRouter } from "src/utils/rtl";

describe("SideNavSectionView", () => {
  it("renders the section label and child items under the section scope", async () => {
    const r = await render(<Harness section={createSection()} />, withRouter());

    expect(r.sideNav_section_label).toHaveTextContent("Workspace");
    expect(r.sideNav_section_link).toBeInTheDocument();
    expect(r.sideNav_section_linkGroup_trigger).toHaveTextContent("Settings");
  });

  it("omits the section label when the section is unlabeled", async () => {
    const r = await render(<Harness section={{ items: [{ label: "Help", onClick: "/help" }] }} />, withRouter());

    expect(r.query.sideNav_section_label).toBeNull();
    expect(r.getByText("Help")).toBeInTheDocument();
  });

  function Harness({ section }: { section: SideNavSection }) {
    const tid = useTestIds({}, "sideNav");

    return <SideNavSectionView {...tid.section} section={section} panelCollapsed={false} showDivider={false} />;
  }

  function createSection(): SideNavSection {
    return {
      label: "Workspace",
      items: [
        { label: "Members", onClick: "/members" },
        {
          label: "Settings",
          links: [
            { label: "General", onClick: "/settings/general" },
            { label: "Billing", onClick: "/settings/billing" },
          ],
        },
      ],
    };
  }
});
