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
    // data-testid, so query both matches and pick out the real (non-clone) dragged element
    fireEvent.mouseDown(r.dragHandle_0);
    const items = r.getAllByTestId("item_a");
    const draggedItem = items.find((el) => !el.hasAttribute("dndgrid-clone"))!;
    const placeholderClone = items.find((el) => el.hasAttribute("dndgrid-clone"))!;

    // Then the active styles are applied to the dragged item, but not to the placeholder marking where it'll drop
    expect(draggedItem).toHaveStyle({ backgroundColor: Palette.Blue700 });
    expect(placeholderClone).not.toHaveStyle({ backgroundColor: Palette.Blue700 });

    // And when the drag is released
    fireEvent.mouseUp(r.dragHandle_0);

    // Then the active styles are fully removed
    expect(r.item_a).not.toHaveStyle({ backgroundColor: Palette.Blue700 });
  });

  it("does not apply the default box-shadow active styling to the placeholder clone", async () => {
    // Given a DnDGrid using the default activeItemStyles (a static box-shadow class, no per-value inline style)
    const r = await render(<Harness onReorder={() => {}} />);
    const boxShadow = "0px 20px 25px -5px rgba(0,0,0,0.1), 0px 10px 10px -5px rgba(0,0,0,0.04)";

    // When the user starts dragging the first item
    fireEvent.mouseDown(r.dragHandle_0);
    const items = r.getAllByTestId("item_a");
    const draggedItem = items.find((el) => !el.hasAttribute("dndgrid-clone"))!;
    const placeholderClone = items.find((el) => el.hasAttribute("dndgrid-clone"))!;

    // Then the box-shadow is applied to the dragged item, but not to the placeholder marking where it'll drop
    expect(draggedItem).toHaveStyle({ boxShadow });
    expect(placeholderClone).not.toHaveStyle({ boxShadow });
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

  it("constrains the dragged item to the Y axis when lockAxis is y", async () => {
    // Given a DnDGrid locked to vertical movement
    const r = await render(<Harness onReorder={() => {}} lockAxis="y" />);

    // When the user starts a drag and moves the pointer on both axes
    fireEvent.mouseDown(r.dragHandle_0, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(r.dndGrid, { clientX: 50, clientY: 80 });
    const draggedItem = r.getAllByTestId("item_a").find((el) => !el.hasAttribute("dndgrid-clone"))!;

    // Then the item only translates vertically
    expect(draggedItem.style.transform).toBe("translate(0px, 70px)");

    fireEvent.mouseUp(r.dragHandle_0);
  });

  it("constrains the dragged item to the X axis when lockAxis is x", async () => {
    // Given a DnDGrid locked to horizontal movement
    const r = await render(<Harness onReorder={() => {}} lockAxis="x" />);

    // When the user starts a drag and moves the pointer on both axes
    fireEvent.mouseDown(r.dragHandle_0, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(r.dndGrid, { clientX: 50, clientY: 80 });
    const draggedItem = r.getAllByTestId("item_a").find((el) => !el.hasAttribute("dndgrid-clone"))!;

    // Then the item only translates horizontally
    expect(draggedItem.style.transform).toBe("translate(40px, 0px)");

    fireEvent.mouseUp(r.dragHandle_0);
  });

  it("does not reorder on ArrowLeft when lockAxis is y", async () => {
    // Given a vertically locked DnDGrid
    const onReorder = vi.fn();
    const r = await render(<Harness onReorder={onReorder} lockAxis="y" />);

    // When the user grabs the first item and presses ArrowLeft, then commits
    const handle = r.dragHandle_0;
    fireEvent.keyDown(handle, { key: " " });
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    fireEvent.keyDown(handle, { key: "Enter" });

    // Then the order is unchanged
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("tracks the dragged item when the pointer moves on the document", async () => {
    // Given a DnDGrid with a drag in progress
    const r = await render(<Harness onReorder={() => {}} />);
    fireEvent.mouseDown(r.dragHandle_0, { clientX: 10, clientY: 10 });

    // When the pointer moves on the document (outside the grid)
    fireEvent.mouseMove(document, { clientX: 50, clientY: 80 });
    const draggedItem = r.getAllByTestId("item_a").find((el) => !el.hasAttribute("dndgrid-clone"))!;

    // Then the item still follows the pointer
    expect(draggedItem.style.transform).toBe("translate(40px, 70px)");

    fireEvent.mouseUp(document);
  });

  it("commits and restores the item when the pointer is released on the document", async () => {
    // Given a DnDGrid with a drag that has moved outside the grid
    const r = await render(<Harness onReorder={() => {}} />);
    fireEvent.mouseDown(r.dragHandle_0, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(document, { clientX: 50, clientY: 80 });

    // When the user releases the pointer on the document
    fireEvent.mouseUp(document);

    // Then the item is put back with no leftover overlay styles or active class
    expect(r.item_a.hasAttribute("style")).toBe(false);
    expect(r.item_a.className).toBe("");
  });
});

function Harness(props: Pick<DnDGridProps, "onReorder" | "activeItemStyles" | "lockAxis">) {
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
