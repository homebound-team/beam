import type { AppNavGroup, AppNavSection } from "src/components/AppNav/appNavTypes";
import { appNavItemKey, linkGroupToMenuItems } from "src/components/AppNav/appNavUtils";

describe("appNavItemKey", () => {
  it("uses the link label and link group label for keys", () => {
    expect(appNavItemKey({ label: "Dashboard", onClick: "/" })).toBe("Dashboard");
    expect(appNavItemKey({ label: "Budgets", items: [{ label: "Budget", onClick: "/budget" }] })).toBe("Budgets");
  });

  it("uses the section label when present", () => {
    expect(appNavItemKey({ label: "Workspace", items: [] })).toBe("Workspace");
  });

  it("derives a stable key for unlabeled sections from child keys", () => {
    const section: AppNavSection = {
      section: true,
      items: [{ label: "Help", onClick: "/help" }],
    };

    expect(appNavItemKey(section)).toBe("section-Help");
  });
});

describe("linkGroupToMenuItems", () => {
  it("maps flat link items to a single menu section", () => {
    const linkGroup: AppNavGroup = {
      label: "Libraries",
      items: [
        { label: "Plans", onClick: "/libraries/plans" },
        { label: "Materials", onClick: "/libraries/materials" },
      ],
    };

    expect(linkGroupToMenuItems(linkGroup)).toEqual([
      { label: "Plans", onClick: "/libraries/plans", disabled: undefined },
      { label: "Materials", onClick: "/libraries/materials", disabled: undefined },
    ]);
  });

  it("inserts dividers between unlabeled AppNavSection children", () => {
    const linkGroup: AppNavGroup = {
      label: "Libraries",
      items: [
        { section: true, items: [{ label: "Plans", onClick: "/libraries/plans" }] },
        { section: true, items: [{ label: "Options", onClick: "/libraries/options" }] },
      ],
    };

    expect(linkGroupToMenuItems(linkGroup)).toEqual([
      { label: "Plans", onClick: "/libraries/plans", disabled: undefined },
      { label: "Options", onClick: "/libraries/options", disabled: undefined, hasDivider: true },
    ]);
  });
});
