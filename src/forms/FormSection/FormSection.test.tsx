import { createObjectState, ObjectConfig } from "@homebound/form-state";
import { fireEvent } from "@testing-library/react";
import { FormSection } from "src/forms/FormSection/FormSection";
import { render } from "src/utils/rtl";

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
    // And the section root is the scroll target for JumpLinks
    expect(r.formSection_section).toHaveAttribute("id", "tradePartners");
  });

  it("renders actions as Buttons / IconButtons", async () => {
    // Given a FormSection with actions
    // When rendered
    const r = await render(
      <FormSection
        title="Trade Partners"
        actions={[
          { label: "Add", onClick: () => {} },
          { kind: "icon", icon: "refresh", label: "Refresh", onClick: () => {} },
        ]}
      />,
    );
    // Then the actions renders as real Buttons / IconButtons
    expect(r.add).toBeInTheDocument();
    expect(r.refresh).toBeInTheDocument();
  });

  it("omits the description and actions slots when not provided", async () => {
    // Given a FormSection with no description or actions
    // When rendered
    const r = await render(<FormSection title="Trade Partners" />);
    // Then neither slot renders
    expect(r.query.formSection_description).not.toBeInTheDocument();
    expect(r.query.formSection_actions).not.toBeInTheDocument();
  });

  it("uses the section-level title style", async () => {
    // Given a top-level FormSection
    // When rendered
    const r = await render(<FormSection title="Trade Partners" />);
    // Then it renders as an h3 at the section (lg) heading size
    expect(r.formSection_title.tagName).toBe("H3");
    expect(r.formSection_title).toHaveStyle({ fontSize: "18px" });
  });

  it("renders childSections at the smaller child title size", async () => {
    // Given a FormSection with a nested childSections array
    // When rendered
    const r = await render(
      <FormSection
        title="Trade Partners"
        childSections={[
          { id: "electrical", title: "Electrical", fields: <div data-testid="electricalFields" /> },
          { id: "plumbing", title: "Plumbing", fields: <div data-testid="plumbingFields" /> },
        ]}
      />,
    );
    // Then both child sections render, nested under the parent
    expect(r.formSection_title).toHaveTextContent("Trade Partners");
    expect(r.electricalFields).toBeInTheDocument();
    expect(r.plumbingFields).toBeInTheDocument();
    // And each child section's title renders as an h4 at the child heading size
    [r.formSection_childSection_header_title_0, r.formSection_childSection_header_title_1].forEach((title) => {
      expect(title.tagName).toBe("H4");
      expect(title).toHaveStyle({ fontSize: "16px" });
    });
  });

  it("does not render a DnDGrid or drag handles when childSections have no orderField", async () => {
    // Given a FormSection with childSections that don't set orderField
    const r = await render(
      <FormSection
        title="Trade Partners"
        childSections={[
          { id: "electrical", title: "Electrical" },
          { id: "plumbing", title: "Plumbing" },
        ]}
      />,
    );
    // Then no DnDGrid wrapper or drag handle is rendered
    expect(r.query.dndGrid).not.toBeInTheDocument();
    expect(r.query.dragHandle).not.toBeInTheDocument();
  });

  it("renders a DnDGrid with a drag handle per childSection when every childSection has orderField", async () => {
    // Given a FormSection with reorderable childSections
    const r = await render(
      <FormSection
        title="Trade Partners"
        childSections={[
          { id: "electrical", title: "Electrical", orderField: orderField(0) },
          { id: "plumbing", title: "Plumbing", orderField: orderField(1) },
        ]}
      />,
    );
    // Then a DnDGrid renders with a drag handle per childSection
    expect(r.dndGrid).toBeInTheDocument();
    expect(r.dragHandle_0).toBeInTheDocument();
    expect(r.dragHandle_1).toBeInTheDocument();
  });

  it("never shows a bottom border on the last reorderable childSection, including after a reorder", async () => {
    // Given a FormSection with three reorderable childSections
    const r = await render(
      <FormSection
        title="Trade Partners"
        childSections={[
          { id: "electrical", title: "Electrical", orderField: orderField(0) },
          { id: "plumbing", title: "Plumbing", orderField: orderField(1) },
          { id: "hvac", title: "HVAC", orderField: orderField(2) },
        ]}
      />,
    );

    // Then only the last section has no bottom border
    expect(r.formSection_childSection_0).toHaveStyle({ borderBottomStyle: "solid" });
    expect(r.formSection_childSection_1).toHaveStyle({ borderBottomStyle: "solid" });
    expect(r.formSection_childSection_2).not.toHaveStyle({ borderBottomStyle: "solid" });

    // When the user grabs the first section's drag handle via keyboard, moves it to the end, and commits
    const handle = r.dragHandle_0;
    fireEvent.keyDown(handle, { key: " " });
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    fireEvent.keyDown(handle, { key: "Enter" });

    // Then the border still only omits from whichever section is now last
    expect(r.formSection_childSection_0).toHaveStyle({ borderBottomStyle: "solid" });
    expect(r.formSection_childSection_1).toHaveStyle({ borderBottomStyle: "solid" });
    expect(r.formSection_childSection_2).not.toHaveStyle({ borderBottomStyle: "solid" });
  });

  it("auto-updates each child's orderField after a keyboard-driven reorder", async () => {
    // Given a FormSection with two reorderable childSections
    const electricalOrder = orderField(0);
    const plumbingOrder = orderField(1);
    const r = await render(
      <FormSection
        title="Trade Partners"
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

    // Then each orderField reflects its new position
    expect(plumbingOrder.value).toBe(0);
    expect(electricalOrder.value).toBe(1);
  });

  it("renders childSections pre-sorted by orderField.value, independent of array order", async () => {
    // Given a FormSection whose childSections array order disagrees with each orderField.value
    const r = await render(
      <FormSection
        title="Trade Partners"
        childSections={[
          { id: "plumbing", title: "Plumbing", orderField: orderField(1) },
          { id: "electrical", title: "Electrical", orderField: orderField(0) },
        ]}
      />,
    );
    // Then they render in orderField order (Electrical first), not array order
    expect(r.formSection_childSection_header_title_0).toHaveTextContent("Electrical");
    expect(r.formSection_childSection_header_title_1).toHaveTextContent("Plumbing");
  });

  it("permutes existing (non-zero-based) order values rather than resetting them to 0-based indices", async () => {
    // Given two childSections whose orderFields start at non-zero values (2 and 3)
    const electricalOrder = orderField(2);
    const plumbingOrder = orderField(3);
    const r = await render(
      <FormSection
        title="Trade Partners"
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
  });

  it("permutes off the latest sort order across back-to-back reorders, not the order as of the last render", async () => {
    // Given a FormSection with three reorderable childSections
    const electricalOrder = orderField(0);
    const plumbingOrder = orderField(1);
    const hvacOrder = orderField(2);
    const r = await render(
      <FormSection
        title="Trade Partners"
        childSections={[
          { id: "electrical", title: "Electrical", orderField: electricalOrder },
          { id: "plumbing", title: "Plumbing", orderField: plumbingOrder },
          { id: "hvac", title: "HVAC", orderField: hvacOrder },
        ]}
      />,
    );

    // When the user moves the first section (Electrical) to the end, committing that reorder...
    const firstHandle = r.dragHandle_0;
    fireEvent.keyDown(firstHandle, { key: " " });
    fireEvent.keyDown(firstHandle, { key: "ArrowDown" });
    fireEvent.keyDown(firstHandle, { key: "ArrowDown" });
    fireEvent.keyDown(firstHandle, { key: "Enter" });

    // Then the DOM (and orderField values) now read Plumbing, HVAC, Electrical
    expect(plumbingOrder.value).toBe(0);
    expect(hvacOrder.value).toBe(1);
    expect(electricalOrder.value).toBe(2);

    // When the user immediately makes a second, independent move -- Plumbing (now first) down one spot,
    // landing on HVAC, Plumbing, Electrical -- without any intervening render of FormSection itself.
    // (`dragHandle_0` is re-queried live by current DOM position, so it now resolves to Plumbing.)
    const secondHandle = r.dragHandle_0;
    fireEvent.keyDown(secondHandle, { key: " " });
    fireEvent.keyDown(secondHandle, { key: "ArrowDown" });
    fireEvent.keyDown(secondHandle, { key: "Enter" });

    // Then the second reorder permutes off the *current* order (Plumbing, HVAC, Electrical), not the
    // original mount-time order (Electrical, Plumbing, HVAC) -- landing on HVAC, Plumbing, Electrical
    expect(hvacOrder.value).toBe(0);
    expect(plumbingOrder.value).toBe(1);
    expect(electricalOrder.value).toBe(2);
  });
});
