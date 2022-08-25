import { Node } from "@react-types/shared";
import React from "react";
import { useMenuSection, useSeparator } from "react-aria";
import { TreeState } from "react-stately";
import { MenuItem } from "src/components/ButtonMenu";
import { MenuItemImpl } from "src/components/internal";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

interface MenuSectionProps {
  section: Node<MenuItem>;
  state: TreeState<MenuItem>;
  onClose: VoidFunction;
  hideLabel?: boolean;
}

export function MenuSectionImpl(props: MenuSectionProps) {
  const { section, state, onClose, hideLabel } = props;
  const { itemProps, groupProps, headingProps } = useMenuSection(section);
  const { separatorProps } = useSeparator({ elementType: "li" });
  const isPersistentSection = section.key !== state.collection.getFirstKey();
  const tid = useTestIds(props);

  return (
    <>
      {isPersistentSection && <li {...separatorProps} css={Css.bt.bGray200.$} />}
      <li {...itemProps} css={Css.if(!isPersistentSection).overflowAuto.$}>
        {!hideLabel && (
          <div {...headingProps} css={Css.bgGray100.overflowHidden.bb.bGray200.ttu.tinyEm.w100.px2.pyPx(4).$}>
            {section.rendered}
          </div>
        )}
        <ul css={Css.listReset.$} {...groupProps} {...tid[isPersistentSection ? "persistentItems" : "menuItems"]}>
          {[...section.childNodes].map((item) => (
            <MenuItemImpl key={item.key} item={item} state={state} onClose={onClose} {...tid} />
          ))}
        </ul>
      </li>
    </>
  );
}
