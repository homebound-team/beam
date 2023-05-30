import { useRef } from "react";
import { Css } from "src";
import { DnDGrid } from "src/components/DnDGrid/DnDGrid";
import { DnDGridItemHandle } from "src/components/DnDGrid/DnDGridItemHandle";
import { useDnDGridItem } from "src/components/DnDGrid/useDnDGridItem";

export default {
  title: "DragAndDropGrid",
};

export function Example() {
  const gridItems: GridItem[] = [
    { id: "1", name: "1", colSpan: 1, rowSpan: 1 },
    { id: "2", name: "2", colSpan: 1, rowSpan: 2 },
    { id: "3", name: "3", colSpan: 2, rowSpan: 1 },
    { id: "4", name: "4", colSpan: 1, rowSpan: 1 },
    { id: "5", name: "5", colSpan: 2, rowSpan: 2 },
    { id: "6", name: "6", colSpan: 1, rowSpan: 1 },
    { id: "7", name: "7", colSpan: 2, rowSpan: 1 },
    { id: "8", name: "8", colSpan: 1, rowSpan: 1 },
    { id: "9", name: "9", colSpan: 2, rowSpan: 2 },
    { id: "10", name: "10", colSpan: 1, rowSpan: 1 },
  ];

  return (
    <DnDGrid
      onReorder={(items) => console.log("onReorder:", { items })}
      gridStyles={Css.gtc(`repeat(4, minmax(280px, 1fr))`).add("gridAutoRows", "120px").gap2.$}
    >
      <div css={Css.br8.bgGray100.ba.bGray400.df.aic.jcc.baseSb.$}>Non-Sortable Grid Item</div>
      {gridItems.map((item) => (
        <DraggableItem key={item.id} item={item} />
      ))}
      <div css={Css.br8.bgGray100.ba.bGray400.df.aic.jcc.baseSb.$}>Non-Sortable Grid Item</div>
    </DnDGrid>
  );
}

function DraggableItem({ item }: { item: GridItem }) {
  const itemRef = useRef(null);
  const { dragItemProps, dragHandleProps } = useDnDGridItem({ id: item.id, itemRef });
  return (
    <div
      ref={itemRef}
      {...dragItemProps}
      css={Css.relative.br8.ba.bGray400.bgWhite.p1.gc(`span ${item.colSpan}`).gr(`span ${item.rowSpan}`).$}
    >
      <div css={Css.absolute.top2.right2.$}>
        <DnDGridItemHandle dragHandleProps={dragHandleProps} />
      </div>
      <div css={Css.w100.h100.br8.bgGray200.df.aic.jcc.$}>{item.name}</div>
    </div>
  );
}

type GridItem = { id: string; name: string; colSpan: number; rowSpan: number };
