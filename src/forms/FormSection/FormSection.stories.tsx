import { createObjectState, ObjectConfig } from "@homebound/form-state";
import { Meta } from "@storybook/react-vite";
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
        { id: "plumbing", title: "Plumbing", fields: <PlaceholderFields count={2} /> },
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
