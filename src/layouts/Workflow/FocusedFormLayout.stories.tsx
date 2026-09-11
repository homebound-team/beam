import type { Meta } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Css, Tokens } from "src/Css";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { newStory, viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { createRightPaneFormSections } from "src/utils/sbComponents";
import { action } from "storybook/actions";
import { FocusedFormLayout } from "./FocusedFormLayout";

export default {
  component: FocusedFormLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} satisfies Meta;

export function Default() {
  return (
    <WithEnvironmentBanner>
      <FocusedFormLayout
        title="Create Design Package"
        onCancel={action("cancel clicked")}
        completeLabel="Create"
        onComplete={action("complete clicked")}
      >
        <FormSectionLayout
          withJumpLinks
          title="Link Design Package"
          description="Connect this package to a market and give it a name."
          sections={createSections()}
        />
      </FocusedFormLayout>
    </WithEnvironmentBanner>
  );
}

export function WithoutJumpLinks() {
  return (
    <WithEnvironmentBanner>
      <FocusedFormLayout
        title="Create Design Package"
        onCancel={action("cancel clicked")}
        completeLabel="Create"
        onComplete={action("complete clicked")}
      >
        <FormSectionLayout
          title="Link Design Package"
          description="Connect this package to a market and give it a name."
          sections={createSections()}
        />
      </FocusedFormLayout>
    </WithEnvironmentBanner>
  );
}

/** `FormSectionLayout withRightPane` under FocusedForm chrome. Toggle JumpLinks. */
export const WithRightPane = newStory(
  ({ withJumpLinks = true }: { withJumpLinks: boolean }) => (
    <WithEnvironmentBanner>
      <FocusedFormLayout
        title="Create Design Package"
        onCancel={action("cancel clicked")}
        completeLabel="Create"
        onComplete={action("complete clicked")}
      >
        <FormSectionLayout
          withJumpLinks={withJumpLinks}
          withRightPane
          title="Link Design Package"
          description="Connect this package to a market and give it a name."
          sections={createRightPaneFormSections()}
        />
      </FocusedFormLayout>
    </WithEnvironmentBanner>
  ),
  {
    args: { withJumpLinks: true },
    argTypes: { withJumpLinks: { control: "boolean" } },
    parameters: { controls: { include: ["withJumpLinks"] } },
  },
);

export function AiMode() {
  return (
    <WithEnvironmentBanner>
      <FocusedFormLayout
        title="Create Design Package"
        onCancel={action("cancel clicked")}
        completeLabel="Create"
        onComplete={action("complete clicked")}
        aiMode
      >
        <FormSectionLayout
          withJumpLinks
          aiMode
          title="Link Design Package"
          description="Connect this package to a market and give it a name."
          sections={createSections()}
        />
      </FocusedFormLayout>
    </WithEnvironmentBanner>
  );
}

function WithEnvironmentBanner({ children }: { children: ReactNode }) {
  return <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>{children}</EnvironmentBannerLayout>;
}

function createSections() {
  return [
    { title: "Setup", description: "Basic package details.", fields: <PlaceholderFields count={2} /> },
    { title: "Package Options", fields: <PlaceholderFields count={3} /> },
    { title: "Internal", excludeJumpLink: true, fields: <PlaceholderFields count={1} /> },
  ];
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
