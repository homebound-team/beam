import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Css, Tokens } from "src/Css";
import { FormSection, FormSectionProps } from "src/forms/FormSection";
import { withBeamDecorator } from "src/utils/sb";

export default {
  component: FormSection,
  decorators: [withBeamDecorator],
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
      actions={[{ label: "Add", onClick: () => {}, variant: "tertiary" }]}
      childSections={[
        {
          title: "Electrical",
          fields: <PlaceholderFields count={2} />,
          description: "Electrical contracts are needed for the construction to continue",
          actions: [{ label: "Add", onClick: () => {}, variant: "tertiary" }],
        },
        { title: "Plumbing", fields: <PlaceholderFields count={2} /> },
        {
          title: "HVAC",
          fields: <PlaceholderFields count={2} />,
          actions: [{ label: "Add", onClick: () => {}, variant: "tertiary" }],
        },
      ]}
    />
  );
}

/**
 * Drag a childSection by its handle (mouse/touch), or focus the handle and use the keyboard:
 * Space to grab, Arrow Up/Down to move, Enter/Space to commit, Escape to cancel.
 */
export function DraggableChildSections() {
  const [childSections, setChildSections] = useState<NonNullable<FormSectionProps["childSections"]>>([
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
  ]);

  return (
    <FormSection
      title="Sub-Contractors"
      actions={[{ label: "Add", onClick: () => {}, variant: "tertiary" }]}
      childSections={childSections}
      draggableChildSections
      onReorderChildSections={(newOrder) =>
        setChildSections((prev) => newOrder.map((id) => prev.find((c) => c.id === id)!))
      }
    />
  );
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
