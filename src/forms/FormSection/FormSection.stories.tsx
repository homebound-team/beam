import { createObjectState, type ObjectConfig } from "@homebound/form-state";
import type { Meta } from "@storybook/react-vite";
import { useMemo } from "react";
import { Css, Tokens } from "src/Css";
import { FormSection } from "src/forms/FormSection/FormSection";
import { withBeamDecorator, withRouter } from "src/utils/sb";

export default {
  component: FormSection,
  decorators: [withBeamDecorator, withRouter()],
} as Meta;

export function WithoutChildren() {
  return (
    <FormSection
      title="General Contractor"
      description="The primary contractor responsible for this project."
      fields={<PlaceholderFields count={2} />}
    />
  );
}

export function WithChildSections() {
  return (
    <FormSection
      title="Sub-Contractors"
      actions={[
        { label: "Add", onClick: () => {}, variant: "tertiary" },
        { kind: "icon", icon: "refresh", label: "Refresh", onClick: () => {} },
        {
          kind: "menu",
          trigger: { icon: "verticalDots", variant: "outline" },
          items: [
            { label: "Export", onClick: () => {} },
            { label: "Archive", onClick: () => {} },
          ],
        },
      ]}
      childSections={[
        {
          id: "electrical",
          title: "Electrical",
          fields: <PlaceholderFields count={2} />,
          description: "Electrical contracts are needed for the construction to continue",
          actions: [{ label: "Add", onClick: () => {}, variant: "tertiary" }],
        },
        {
          id: "plumbing",
          title: "Plumbing",
          fields: <PlaceholderFields count={2} />,
          tag: { text: "7 days to cutoff", type: "warning" },
        },
        {
          id: "hvac",
          title: "HVAC",
          fields: <PlaceholderFields count={2} />,
          actions: [{ label: "Add", onClick: () => {}, variant: "tertiary" }],
        },
      ]}
    />
  );
}

export function WithDraggableChildSections() {
  return (
    <FormSection
      title="Sub-Contractors"
      childSections={[
        { id: "electrical", title: "Electrical", orderField: orderField(0), fields: <PlaceholderFields count={2} /> },
        { id: "plumbing", title: "Plumbing", orderField: orderField(1), fields: <PlaceholderFields count={2} /> },
        { id: "hvac", title: "HVAC", orderField: orderField(2), fields: <PlaceholderFields count={2} /> },
      ]}
    />
  );
}

/** A checkbox child that opts into an add-on, alongside plain children. */
export function WithCheckboxChildSections() {
  const formState = useMemo(() => createObjectState(selectionConfig, { addWasherDryer: true }), []);
  return (
    <FormSection
      title="Whole House"
      childSections={[
        { id: "flooring", title: "Flooring", fields: <PlaceholderFields count={2} /> },
        {
          id: "washerDryer",
          title: "Add Washer and Dryer",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
          selectedField: formState.addWasherDryer,
          tag: { text: "7 days to cutoff", type: "warning" },
          fields: <PlaceholderFields count={2} />,
        },
      ]}
    />
  );
}

/** `selectedChildField` turns the childSections into a single radio group; the field holds the selected child's `id`. */
export function WithRadioChildSections() {
  const formState = useMemo(() => createObjectState(selectionConfig, { applianceId: "topLoad" }), []);
  return (
    <FormSection
      title="Washer and Dryer"
      selectedChildField={formState.applianceId}
      childSections={[
        { id: "frontLoad", title: "Front Load Washer and Dryer", fields: <PlaceholderFields count={1} /> },
        { id: "topLoad", title: "Top Load Washer and Dryer", fields: <PlaceholderFields count={1} /> },
        {
          id: "stacked",
          title: "Stacked Washer and Dryer",
          fields: <PlaceholderFields count={1} />,
          tag: { text: "7 days to cutoff", type: "warning" },
        },
      ]}
    />
  );
}

type SelectionInput = { addWasherDryer?: boolean | null; applianceId?: string | null };
const selectionConfig: ObjectConfig<SelectionInput> = {
  addWasherDryer: { type: "value" },
  applianceId: { type: "value" },
};

type OrderInput = { order?: number | null };
const orderConfig: ObjectConfig<OrderInput> = { order: { type: "value" } };
/** A real form-state `FieldState<number>`, so this story exercises the actual drag-to-reorder integration. */
function orderField(value: number | null) {
  return createObjectState(orderConfig, { order: value }).order;
}

function PlaceholderFields({ count }: { count: number }) {
  return (
    <div css={Css.df.fdc.gap1.$}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} css={Css.hPx(36).br4.bgColor(Tokens.SurfaceSeparator).$} />
      ))}
    </div>
  );
}
