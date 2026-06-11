import { ButtonMenu, MenuItem } from "src/components/ButtonMenu";
import { useBreakpoint } from "src/hooks";
import { useTestIds } from "src/utils";

export type TableView = "list" | "card";

type ViewToggleButtonProps = {
  view: TableView;
  onChange: (view: TableView) => void;
  defaultOpen?: boolean;
};

export function ViewToggleButton({ view, onChange, defaultOpen }: ViewToggleButtonProps) {
  const { sm } = useBreakpoint();
  const tid = useTestIds({}, "viewToggleButton");

  const menuItems: MenuItem[] = [
    { label: "List", icon: "projects", onClick: () => onChange("list") },
    { label: "Card", icon: "tile", onClick: () => onChange("card") },
  ];

  return (
    <ButtonMenu
      trigger={{ icon: view === "list" ? "projects" : "tile", label: "", size: "md", variant: "secondaryBlack" }}
      items={menuItems}
      hideEndAdornment={sm}
      defaultOpen={defaultOpen}
      {...tid}
    />
  );
}
