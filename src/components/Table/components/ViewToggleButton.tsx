import { ButtonMenu, type MenuItem } from "src/components/ButtonMenu";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useTestIds } from "src/utils/useTestIds";

export type TableView = "list" | "card";

type ViewToggleButtonProps = {
  view: TableView;
  onChange: (view: TableView) => void;
  defaultOpen?: boolean;
  /** Renders the icon-only trigger. Defaults to the `sm` breakpoint. */
  compact?: boolean;
};

export function ViewToggleButton({ view, onChange, defaultOpen, ...props }: ViewToggleButtonProps) {
  const { sm } = useBreakpoint();
  const { compact = sm } = props;
  const tid = useTestIds({}, "viewToggleButton");

  const menuItems: MenuItem[] = [
    { label: "List", icon: "projects", onClick: () => onChange("list") },
    { label: "Card", icon: "tile", onClick: () => onChange("card") },
  ];

  const icon = view === "list" ? "projects" : "tile";

  return (
    <ButtonMenu
      trigger={compact ? { icon, variant: "outline" } : { icon, label: "", size: "md", variant: "secondaryBlack" }}
      items={menuItems}
      defaultOpen={defaultOpen}
      {...tid}
    />
  );
}
