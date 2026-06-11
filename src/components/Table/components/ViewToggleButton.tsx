import { useRef } from "react";
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import { MenuItem } from "src/components/ButtonMenu";
import { Menu } from "src/components/internal/Menu";
import { OverlayTrigger } from "src/components/internal/OverlayTrigger";
import { useBreakpoint } from "src/hooks";

export type TableView = "list" | "tile";

type ViewToggleButtonProps = {
  view: TableView;
  onChange: (view: TableView) => void;
  defaultOpen?: boolean;
};

const menuItems: MenuItem[] = [
  { label: "List", icon: "projects", onClick: () => {} },
  { label: "Tile", icon: "tile", onClick: () => {} },
];

export function ViewToggleButton({ view, onChange, defaultOpen }: ViewToggleButtonProps) {
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger({}, state, buttonRef);
  const { sm } = useBreakpoint();

  return (
    <OverlayTrigger
      trigger={{ icon: view === "list" ? "projects" : "tile", label: "", size: "md", variant: "secondaryBlack" }}
      menuTriggerProps={menuTriggerProps}
      state={state}
      buttonRef={buttonRef}
      hideEndAdornment={sm}
    >
      <Menu
        ariaMenuProps={menuProps}
        onClose={() => state.close()}
        items={menuItems}
        selectedItem={view === "list" ? "List" : "Tile"}
        onChange={(key) => onChange(key.toLowerCase() as TableView)}
      />
    </OverlayTrigger>
  );
}
