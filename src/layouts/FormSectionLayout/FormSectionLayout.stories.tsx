import { Meta } from "@storybook/react-vite";
import { Css, Tokens } from "src/Css";
import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { withBeamDecorator } from "src/utils/sb";

export default {
  component: FormSectionLayout,
  decorators: [withBeamDecorator],
} as Meta;

export function Default() {
  return (
    <FormSectionLayout
      title="Trade Partners"
      description="Assign and manage trade partners for this project."
      actions={[{ label: "Save draft", onClick: () => {}, variant: "tertiary" }]}
      initialFields={<PlaceholderFields count={2} />}
      sections={[
        {
          title: "General Contractor",
          description: "The primary contractor responsible for this project.",
          actions: [
            { label: "Add", onClick: () => {}, variant: "tertiary" },
            { kind: "icon", icon: "refresh", label: "Refresh", onClick: () => {} },
          ],
          fields: <PlaceholderFields count={2} />,
        },
        {
          title: "Sub-Contractors",
          fields: <PlaceholderFields count={3} />,
        },
      ]}
    />
  );
}

export function Basic() {
  return (
    <FormSectionLayout
      title="Author Details"
      sections={[{ title: "Basic Information", fields: <PlaceholderFields count={2} /> }]}
    />
  );
}

export function NestedChildSections() {
  return (
    <FormSectionLayout
      title="Trade Partners"
      description="Assign and manage trade partners for this project."
      sections={[
        {
          title: "Sub-Contractors",
          description: "Assign and manage trade partners for this project.",
          actions: [{ label: "Add", onClick: () => {}, variant: "secondary", size: "sm" }],
          childSections: [
            {
              title: "Electrical",
              actions: [{ label: "Add", onClick: () => {}, variant: "secondary", size: "sm" }],
              fields: <PlaceholderFields count={2} />,
            },
            {
              title: "Plumbing",
              actions: [{ label: "Add", onClick: () => {}, variant: "secondary", size: "sm" }],
              fields: <PlaceholderFields count={2} />,
            },
            {
              title: "HVAC",
              actions: [{ label: "Add", onClick: () => {}, variant: "secondary", size: "sm" }],
              fields: <PlaceholderFields count={2} />,
            },
          ],
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
