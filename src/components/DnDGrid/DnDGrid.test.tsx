import { fireEvent } from "@testing-library/react";
import { useRef } from "react";
import { DnDGrid, DnDGridProps } from "src/components/DnDGrid/DnDGrid";
import { DnDGridItemHandle } from "src/components/DnDGrid/DnDGridItemHandle";
import { useDnDGridItem } from "src/components/DnDGrid/useDnDGridItem";
import { Css, Palette } from "src/Css";
import { render } from "src/utils/rtl";
import { vi } from "vitest";

describe("DnDGrid", () => {
  it("leaves no leftover overlay-positioning style or class on the dragged element after a drag commits", async () => {
    // Given a DnDGrid with two items, using the default activeItemStyles
    const r = await render(<Harness onReorder={() => {}} />);

    // When the user mouse-drags the first item and releases
    fireEvent.mouseDown(r.dragHandle_0);
    fireEvent.mouseUp(r.dragHandle_0);

    // Then the item is left exactly as it started -- no leftover position/zIndex/etc, and no lingering active class
    expect(r.item_a.hasAttribute("style")).toBe(false);
    expect(r.item_a.className).toBe("");
  });

  it("applies a custom activeItemStyles Truss expression during a drag and fully removes it after", async () => {
    // Given a DnDGrid with a custom, real Truss activeItemStyles expression
    const r = await render(<Harness onReorder={() => {}} activeItemStyles={Css.bgColor(Palette.Blue700).$} />);
    expect(r.item_a).not.toHaveStyle({ backgroundColor: Palette.Blue700 });

    // When the user starts dragging the first item -- mid-drag, a placeholder clone shares the same
    // data-testid, so query the real (non-clone) dragged element directly
    fireEvent.mouseDown(r.dragHandle_0);
    const draggedItem = document.querySelector('[data-testid="item_a"]:not([dndgrid-clone])')!;

    // Then the active styles are applied
    expect(draggedItem).toHaveStyle({ backgroundColor: Palette.Blue700 });

    // And when the drag is released
    fireEvent.mouseUp(r.dragHandle_0);

    // Then the active styles are fully removed
    expect(r.item_a).not.toHaveStyle({ backgroundColor: Palette.Blue700 });
  });

  it("commits a keyboard-driven reorder and cleans up the active styles", async () => {
    // Given a DnDGrid with two items and a reorder spy
    const onReorder = vi.fn();
    const r = await render(<Harness onReorder={onReorder} />);

    // When the user grabs the first item via keyboard, moves it down one, and commits
    const handle = r.dragHandle_0;
    fireEvent.keyDown(handle, { key: " " });
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    fireEvent.keyDown(handle, { key: "Enter" });

    // Then onReorder fires with the new order, and the item is left with no lingering active-styles class
    expect(onReorder).toHaveBeenCalledWith(["b", "a"]);
    expect(r.item_a.className).toBe("");
  });
});

function Harness(props: Pick<DnDGridProps, "onReorder" | "activeItemStyles">) {
  return (
    <DnDGrid {...props}>
      <Item id="a" />
      <Item id="b" />
    </DnDGrid>
  );
}

function Item({ id }: { id: string }) {
  const itemRef = useRef<HTMLDivElement>(null);
  const { dragItemProps, dragHandleProps } = useDnDGridItem({ id, itemRef });
  return (
    <div ref={itemRef} {...dragItemProps} data-testid={`item_${id}`}>
      <DnDGridItemHandle dragHandleProps={dragHandleProps} />
    </div>
  );
}