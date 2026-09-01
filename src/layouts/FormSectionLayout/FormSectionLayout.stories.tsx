import { Meta } from "@storybook/react-vite";
import { Css, Tokens } from "src/Css";
import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { newStory, withAiBackground, withBeamDecorator } from "src/utils/sb";

export default {
  component: FormSectionLayout,
  decorators: [withBeamDecorator],
  parameters: { layout: "fullscreen" },
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

export function WithAutoSave() {
  return (
    <FormSectionLayout
      title="Trade Partners"
      description="Assign and manage trade partners for this project."
      withAutoSave
      actions={[{ label: "Save draft", onClick: () => {}, variant: "tertiary" }]}
      initialFields={<PlaceholderFields count={2} />}
      sections={[{ title: "General Contractor", fields: <PlaceholderFields count={2} /> }]}
    />
  );
}

/** `aiMode` wraps the form in {@link AiCard} and applies the gradient title. */
export const AiMode = newStory(
  () => (
    <FormSectionLayout
      aiMode
      title="Trade Partners"
      description="Assign and manage trade partners for this project."
      actions={[{ label: "Save draft", onClick: () => {}, variant: "tertiary" }]}
      initialFields={<PlaceholderFields count={2} />}
      sections={[
        {
          title: "General Contractor",
          description: "The primary contractor responsible for this project.",
          fields: <PlaceholderFields count={2} />,
        },
      ]}
    />
  ),
  { decorators: [withAiBackground] },
);

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
              id: "electrical",
              title: "Electrical",
              actions: [{ label: "Add", onClick: () => {}, variant: "secondary", size: "sm" }],
              fields: <PlaceholderFields count={2} />,
            },
            {
              id: "plumbing",
              title: "Plumbing",
              actions: [{ label: "Add", onClick: () => {}, variant: "secondary", size: "sm" }],
              fields: <PlaceholderFields count={2} />,
            },
            {
              id: "hvac",
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

/** JumpLinks rail from section titles (2+ includable sections; hidden on `sm`). */
export function WithJumpLinks() {
  return (
    <FormSectionLayout
      withJumpLinks
      title="Link Design Package"
      description="Connect this package to a market and give it a name."
      sections={[
        { title: "Setup", description: "Basic package details.", fields: <PlaceholderFields count={2} /> },
        { title: "Package Options", fields: <PlaceholderFields count={3} /> },
        { title: "Internal", excludeJumpLink: true, fields: <PlaceholderFields count={1} /> },
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
