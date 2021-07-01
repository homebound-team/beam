import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { PropsWithChildren, useRef } from "react";
import { useOverlayPosition } from "react-aria";
import { useTreeState } from "react-stately";
import { Menu } from "src/components/internal/Menu";
import { Popover } from "src/components/internal/Popover";
import { noop } from "src/utils";
import { MenuItem } from "./MenuItem";

export default {
  component: Menu,
  title: "Components/Menu",
} as Meta;

export function BasicMenuItems() {
  const ref = useRef(null);
  return (
    <TestMenu>
      <MenuItem item={{ label: "Test menu item", onClick: noop }} itemRef={ref} isFocused={false} itemProps={{}} />
      <MenuItem item={{ label: "Another menu item", onClick: noop }} itemRef={ref} isFocused={false} itemProps={{}} />
    </TestMenu>
  );
}

export function IconMenuItems() {
  const ref = useRef(null);
  return (
    <TestMenu>
      <MenuItem
        item={{ label: "Test menu item", icon: "plus", onClick: action("Menu item clicked") }}
        itemRef={ref}
        isFocused={false}
        itemProps={{}}
      />
      <MenuItem
        item={{ label: "Info Circle icon", icon: "infoCircle", onClick: action("Menu item clicked") }}
        itemRef={ref}
        isFocused={false}
        itemProps={{}}
      />
    </TestMenu>
  );
}

export function ImageMenuItems() {
  const ref = useRef(null);
  return (
    <TestMenu>
      <MenuItem
        item={{
          label: "Brandon Dow",
          src: "https://lh3.googleusercontent.com/a-/AOh14Ghc-9SDWv_nlkDJ58nXzqMSH094Ed0FMvEKlpgI=s96-c",
          isAvatar: true,
          onClick: noop,
        }}
        itemRef={ref}
        isFocused={false}
        itemProps={{}}
      />
      <MenuItem
        item={{
          label: "Another Brandon!",
          src: "https://lh3.googleusercontent.com/a-/AOh14Ghc-9SDWv_nlkDJ58nXzqMSH094Ed0FMvEKlpgI=s96-c",
          isAvatar: true,
          onClick: noop,
        }}
        itemRef={ref}
        isFocused={false}
        itemProps={{}}
      />
    </TestMenu>
  );
}

function TestMenu({ children }: PropsWithChildren<any>) {
  const state = useTreeState({});
  const targetRef = useRef(null);
  const popoverRef = useRef(null);
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef,
    overlayRef: popoverRef,
    shouldFlip: true,
    isOpen: true,
    onClose: noop,
  });
  return (
    <>
      <span ref={targetRef}></span>
      <Popover onClose={noop} isOpen={true} popoverRef={popoverRef} positionProps={positionProps}>
        <Menu state={state} ariaMenuProps={{}}>
          {children}
        </Menu>
      </Popover>
    </>
  );
}
