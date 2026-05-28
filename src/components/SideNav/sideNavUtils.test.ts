import type { SideNavSection } from "src/components/SideNav/sideNavTypes";
import { sideNavItemKey } from "src/components/SideNav/sideNavUtils";

describe("sideNavItemKey", () => {
  it("uses the link label and link group label for keys", () => {
    expect(sideNavItemKey({ label: "Dashboard", onClick: "/" })).toBe("Dashboard");
    expect(sideNavItemKey({ label: "Budgets", links: [{ label: "Budget", onClick: "/budget" }] })).toBe("Budgets");
  });

  it("uses the section label when present", () => {
    expect(sideNavItemKey({ label: "Workspace", items: [] })).toBe("Workspace");
  });

  it("derives a stable key for unlabeled sections from child keys", () => {
    const section: SideNavSection = {
      items: [{ label: "Help", onClick: "/help" }],
    };

    expect(sideNavItemKey(section)).toBe("section-Help");
  });
});
