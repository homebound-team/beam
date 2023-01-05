import { Node } from "@react-types/shared";
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
}

export function MenuSectionImpl(props: MenuSectionProps) {
  const { section, state, onClose } = props;
  const { itemProps, groupProps } = useMenuSection(props.section);
  const { separatorProps } = useSeparator({ elementType: "li" });
  const isPersistentSection = section.key !== state.collection.getFirstKey();
  const tid = useTestIds(props);

  return (
    <>
      {isPersistentSection && <li {...separatorProps} css={Css.bt.bGray200.$} />}
      <li {...itemProps} css={Css.if(!isPersistentSection).overflowAuto.$}>
        <ul css={Css.listReset.$} {...groupProps} {...tid[isPersistentSection ? "persistentItems" : "menuItems"]}>
          {[...section.childNodes].map((item) => (
            <MenuItemImpl key={item.key} item={item} state={state} onClose={onClose} {...tid} />
          ))}
        </ul>
      </li>
    </>
  );
}
