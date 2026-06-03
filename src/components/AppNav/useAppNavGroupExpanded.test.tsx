import type { AppNavGroup } from "src/components/AppNav/appNavTypes";
import {
  APP_NAV_EXPANDED_LINK_GROUPS_STORAGE_KEY,
  useAppNavGroupExpanded,
} from "src/components/AppNav/useAppNavGroupExpanded";
import { useTestIds } from "src/utils";
import { click, render } from "src/utils/rtl";

describe("useAppNavGroupExpanded", () => {
  it("starts collapsed when no stored value, no active link, and no defaultExpanded", async () => {
    const r = await render(<Harness linkGroup={createLinkGroup()} />);

    expect(r.linkGroupExpanded_expanded).toHaveTextContent("false");
  });

  it("auto-expands when a child link is active", async () => {
    const r = await render(
      <Harness linkGroup={createLinkGroup({ items: [{ label: "Budget", onClick: "/budget", active: true }] })} />,
    );

    expect(r.linkGroupExpanded_expanded).toHaveTextContent("true");
  });

  it("uses defaultExpanded when no stored value and no active link", async () => {
    const r = await render(<Harness linkGroup={createLinkGroup({ defaultExpanded: true })} />);

    expect(r.linkGroupExpanded_expanded).toHaveTextContent("true");
  });

  it("persists toggled state to localStorage under the link group label", async () => {
    const r = await render(<Harness linkGroup={createLinkGroup()} />);

    click(r.linkGroupExpanded_toggle);

    expect(r.linkGroupExpanded_expanded).toHaveTextContent("true");
    const stored = JSON.parse(window.localStorage.getItem(APP_NAV_EXPANDED_LINK_GROUPS_STORAGE_KEY) ?? "{}");
    expect(stored).toEqual({ Budgets: true });
  });

  it("prefers stored state over active-link auto-expand", async () => {
    window.localStorage.setItem(APP_NAV_EXPANDED_LINK_GROUPS_STORAGE_KEY, JSON.stringify({ Budgets: false }));

    const r = await render(
      <Harness linkGroup={createLinkGroup({ items: [{ label: "Budget", onClick: "/budget", active: true }] })} />,
    );

    expect(r.linkGroupExpanded_expanded).toHaveTextContent("false");
  });
});

function createLinkGroup(overrides: Partial<AppNavGroup> = {}): AppNavGroup {
  return {
    label: "Budgets",
    items: [{ label: "Budget", onClick: "/budget" }],
    ...overrides,
  };
}

function Harness({ linkGroup }: { linkGroup: AppNavGroup }) {
  const tid = useTestIds({}, "linkGroupExpanded");
  const { expanded, onToggle } = useAppNavGroupExpanded(linkGroup);

  return (
    <>
      <button type="button" {...tid.toggle} onClick={onToggle}>
        Toggle
      </button>
      <span {...tid.expanded}>{String(expanded)}</span>
    </>
  );
}
