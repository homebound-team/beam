import { Node } from "@react-types/shared";
import { useMenuSection, useSeparator } from "react-aria";
import { TreeState } from "react-stately";
import { MenuItem } from "src/components/ButtonMenu";
import { MenuItemImpl } from "src/components/internal";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

type MenuSectionProps = {
  section: Node<MenuItem>;
  state: TreeState<MenuItem>;
  onClose: VoidFunction;
};

export function MenuSectionImpl(props: MenuSectionProps) {
  const { section, state, onClose } = props;
  const { itemProps, groupProps } = useMenuSection(props.section);
  const { separatorProps } = useSeparator({ elementType: "li" });
  const isPersistentSection = section.key !== state.collection.getFirstKey();
  const tid = useTestIds(props);

  return (
    <>
      {isPersistentSection && <li {...separatorProps} css={Css.bt.bc(Tokens.SurfaceSeparator).$} />}
      <li {...itemProps} css={Css.color(Tokens.OnSurface).if(!isPersistentSection).oa.$}>
        <ul css={Css.listReset.$} {...groupProps} {...tid[isPersistentSection ? "persistentItems" : "menuItems"]}>
          {[...section.childNodes].map((item) => (
            <MenuItemImpl key={item.key} item={item} state={state} onClose={onClose} {...tid} />
          ))}
        </ul>
      </li>
    </>
  );
}
