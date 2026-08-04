import { createObjectState, ObjectConfig } from "@homebound/form-state";
import { fireEvent } from "@testing-library/react";
import { FormSection } from "src/forms/FormSection";
import { render } from "src/utils/rtl";
import { vi } from "vitest";

type OrderInput = { order?: number | null };
const orderConfig: ObjectConfig<OrderInput> = { order: { type: "value" } };
/** A real form-state `FieldState<number>`, so orderField tests exercise the actual integration. */
function orderField(value: number | null) {
  return createObjectState(orderConfig, { order: value }).order;
}

describe("FormSection", () => {
  it("renders title, description, and fields", async () => {
    // Given a FormSection with a title, description, and fields
    // When rendered
    const r = await render(
      <FormSection
        title="Trade Partners"
        description="Manage trade partner assignments"
        fields={<div data-testid="customFields">Fields</div>}
      />,
    );
    // Then the title, description, and fields all render
    expect(r.formSection_title).toHaveTextContent("Trade Partners");
    expect(r.formSection_description).toHaveTextContent("Manage trade partner assignments");
    expect(r.customFields).toBeInTheDocument();
  });

  it("renders actions as Buttons", async () => {
    // Given a FormSection with actions
    // When rendered
    const r = await render(<FormSection title="Trade Partners" actions={[{ label: "Add", onClick: () => {} }]} />);
    // Then the action renders as a real Button
    expect(r.add).toBeInTheDocument();
  });

  it("omits the description and actions slots when not provided", async () => {
    // Given a FormSection with no description or actions
    // When rendered
    const r = await render(<FormSection title="Trade Partners" />);
    // Then neither slot renders
    expect(r.query.formSection_description).not.toBeInTheDocument();
    expect(r.query.formSection_actions).not.toBeInTheDocument();
  });

  it("uses the section-level title style by default", async () => {
    // Given a top-level FormSection (isChild omitted)
    // When rendered
    const r = await render(<FormSection title="Trade Partners" />);
    // Then it renders at the section (lg) heading size
    expect(r.formSection_title).toHaveStyle({ fontSize: "18px" });
  });

  it("uses the smaller child title style when isChild is set", async () => {
    // Given a FormSection explicitly marked isChild
    // When rendered
    const r = await render(<FormSection title="Sub-Contractors" isChild />);
    // Then it renders at the child (md) heading size
    expect(r.formSection_title).toHaveStyle({ fontSize: "16px" });
  });

  it("renders childSections at the smaller child title size", async () => {
    // Given a FormSection with a nested childSections array
    // When rendered
    const r = await render(
      <FormSection
        title="Trade Partners"
        childSections={[
          { title: "Electrical", fields: <div data-testid="electricalFields" /> },
          { title: "Plumbing", fields: <div data-testid="plumbingFields" /> },
        ]}
      />,
    );
    // Then both child sections render, nested under the parent
    expect(r.formSection_title).toHaveTextContent("Trade Partners");
    expect(r.electricalFields).toBeInTheDocument();
    expect(r.plumbingFields).toBeInTheDocument();
    // And each child section's title renders at the child heading size
    [r.formSection_childSection_title_0, r.formSection_childSection_title_1].forEach((title) =>
      expect(title).toHaveStyle({ fontSize: "16px" }),
    );
  });

  it("does not render a DnDGrid or drag handles by default", async () => {
    // Given a FormSection with childSections and neither draggable prop set
    const r = await render(
      <FormSection title="Trade Partners" childSections={[{ title: "Electrical" }, { title: "Plumbing" }]} />,
    );
    // Then no DnDGrid wrapper or drag handle is rendered
    expect(r.query.dndGrid).not.toBeInTheDocument();
    expect(r.query.dragHandle).not.toBeInTheDocument();
  });

  it("does not enable dragging when only one of draggableChildSections/onReorderChildSections is set", async () => {
    // Given a FormSection with only draggableChildSections set
    const r1 = await render(
      <FormSection title="Trade Partners" draggableChildSections childSections={[{ title: "Electrical" }]} />,
    );
    // Then no DnDGrid renders
    expect(r1.query.dndGrid).not.toBeInTheDocument();

    // And given a FormSection with only onReorderChildSections set
    const r2 = await render(
      <FormSection
        title="Trade Partners"
        onReorderChildSections={() => {}}
        childSections={[{ title: "Electrical" }]}
      />,
    );
    // Then no DnDGrid renders
    expect(r2.query.dndGrid).not.toBeInTheDocument();
  });

  it("renders a DnDGrid with a drag handle per childSection when both draggable props are set", async () => {
    // Given a FormSection with both draggable props set
    const r = await render(
      <FormSection
        title="Trade Partners"
        draggableChildSections
        onReorderChildSections={() => {}}
        childSections={[
          { id: "electrical", title: "Electrical" },
          { id: "plumbing", title: "Plumbing" },
        ]}
      />,
    );
    // Then a DnDGrid renders with a drag handle per childSection
    expect(r.dndGrid).toBeInTheDocument();
    expect(r.dragHandle_0).toBeInTheDocument();
    expect(r.dragHandle_1).toBeInTheDocument();
  });

  it("calls onReorderChildSections with the new id order after a keyboard-driven reorder", async () => {
    // Given a FormSection with two draggable childSections and a reorder spy
    const onReorderChildSections = vi.fn();
    const r = await render(
      <FormSection
        title="Trade Partners"
        draggableChildSections
        onReorderChildSections={onReorderChildSections}
        childSections={[
          { id: "electrical", title: "Electrical" },
          { id: "plumbing", title: "Plumbing" },
        ]}
      />,
    );

    // When the user grabs the first section's drag handle via keyboard, moves it down one, and commits
    const handle = r.dragHandle_0;
    fireEvent.keyDown(handle, { key: " " });
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    fireEvent.keyDown(handle, { key: "Enter" });

    // Then onReorderChildSections fires with "electrical" and "plumbing" swapped
    expect(onReorderChildSections).toHaveBeenCalledWith(["plumbing", "electrical"]);
  });

  it("renders a hidden input mirroring orderField.value, and omits it when orderField isn't provided", async () => {
    // Given a FormSection with one childSection that has an orderField and one that doesn't
    const r = await render(
      <FormSection
        title="Trade Partners"
        draggableChildSections
        childSections={[
          { id: "electrical", title: "Electrical", orderField: orderField(2) },
          { id: "plumbing", title: "Plumbing" },
        ]}
      />,
    );
    // Then a hidden input mirrors the first section's order value
    expect(r.orderInput_0).toHaveValue("2");
    // And no hidden input renders for the section without an orderField
    expect(r.query.orderInput_1).not.toBeInTheDocument();
  });

  it("auto-updates each child's orderField after a keyboard-driven reorder, with no onReorderChildSections passed", async () => {
    // Given a FormSection with two draggable childSections, each with an orderField, and no onReorderChildSections
    const electricalOrder = orderField(0);
    const plumbingOrder = orderField(1);
    const r = await render(
      <FormSection
        title="Trade Partners"
        draggableChildSections
        childSections={[
          { id: "electrical", title: "Electrical", orderField: electricalOrder },
          { id: "plumbing", title: "Plumbing", orderField: plumbingOrder },
        ]}
      />,
    );

    // When the user grabs the first section's drag handle via keyboard, moves it down one, and commits
    const handle = r.dragHandle_0;
    fireEvent.keyDown(handle, { key: " " });
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    fireEvent.keyDown(handle, { key: "Enter" });

    // Then each orderField reflects its new position — proving dragging works via orderField alone
    expect(plumbingOrder.value).toBe(0);
    expect(electricalOrder.value).toBe(1);
  });

  it("renders childSections pre-sorted by orderField.value, independent of array order", async () => {
    // Given a FormSection whose childSections array order disagrees with each orderField.value
    const r = await render(
      <FormSection
        title="Trade Partners"
        draggableChildSections
        childSections={[
          { id: "plumbing", title: "Plumbing", orderField: orderField(1) },
          { id: "electrical", title: "Electrical", orderField: orderField(0) },
        ]}
      />,
    );
    // Then they render in orderField order (Electrical first), not array order
    expect(r.formSection_childSection_title_0).toHaveTextContent("Electrical");
    expect(r.formSection_childSection_title_1).toHaveTextContent("Plumbing");
  });

  it("preserves array order when only some childSections have an orderField", async () => {
    // Given only one of two childSections has an orderField
    const r = await render(
      <FormSection
        title="Trade Partners"
        draggableChildSections
        childSections={[
          { id: "plumbing", title: "Plumbing", orderField: orderField(5) },
          { id: "electrical", title: "Electrical" },
        ]}
      />,
    );
    // Then array order is preserved rather than partially sorting
    expect(r.formSection_childSection_title_0).toHaveTextContent("Plumbing");
    expect(r.formSection_childSection_title_1).toHaveTextContent("Electrical");
  });

  it("permutes existing (non-zero-based) order values rather than resetting them to 0-based indices", async () => {
    // Given two childSections whose orderFields start at 2 and 3 (e.g. sharing a numbering space with
    // sections outside this childSections list), plus a reorder side-effect callback
    const onReorderChildSections = vi.fn();
    const electricalOrder = orderField(2);
    const plumbingOrder = orderField(3);
    const r = await render(
      <FormSection
        title="Trade Partners"
        draggableChildSections
        onReorderChildSections={onReorderChildSections}
        childSections={[
          { id: "electrical", title: "Electrical", orderField: electricalOrder },
          { id: "plumbing", title: "Plumbing", orderField: plumbingOrder },
        ]}
      />,
    );

    // When the user grabs the first section's drag handle via keyboard, moves it down one, and commits
    const handle = r.dragHandle_0;
    fireEvent.keyDown(handle, { key: " " });
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    fireEvent.keyDown(handle, { key: "Enter" });

    // Then the existing {2, 3} values are swapped, never reset to {0, 1}
    expect(plumbingOrder.value).toBe(2);
    expect(electricalOrder.value).toBe(3);
    // And the consumer's callback still fires, as a side effect rather than the source of truth
    expect(onReorderChildSections).toHaveBeenCalledWith(["plumbing", "electrical"]);
  });
});
