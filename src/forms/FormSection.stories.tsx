import { Meta } from "@storybook/react-vite";
import { Css, Tokens } from "src/Css";
import { FormSection } from "src/forms/FormSection";
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
      actions={[
        { label: "Add", onClick: () => {}, variant: "tertiary" },
        { kind: "icon", icon: "refresh", label: "Refresh", onClick: () => {}, variant: "outline" },
      ]}
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

function PlaceholderFields({ count }: { count: number }) {
  return (
    <div css={Css.df.fdc.gap1.$}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} css={Css.hPx(36).br4.bgColor(Tokens.SurfaceSeparator).$} />
      ))}
    </div>
  );
}
