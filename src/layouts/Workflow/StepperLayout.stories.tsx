import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { AiLoadingPanel } from "src/components/AiLoadingPanel";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { Css, Tokens } from "src/Css";
import { StepperLayoutFormApp } from "src/forms/StepperLayoutFormApp";
import { CenteredLayout } from "src/layouts/CenteredLayout";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { GridTableLayoutExample } from "src/utils/sbComponents";
import { action } from "storybook/actions";
import { pageContentPaddingX } from "../layoutSpacing";
import { StepperLayout } from "./StepperLayout";

export default {
  component: StepperLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} satisfies Meta;

/** Real form-state steps in {@link FormSectionLayout}, under an environment banner. */
export function WithFormSectionLayout() {
  return (
    <WithEnvironmentBanner>
      <StepperLayoutFormApp />
    </WithEnvironmentBanner>
  );
}

/** Same form as {@link WithFormSectionLayout}, with `aiMode` on the workflow and form layout. */
export function AiMode() {
  return (
    <WithEnvironmentBanner>
      <StepperLayoutFormApp aiMode />
    </WithEnvironmentBanner>
  );
}

/** Loading step: {@link AiLoadingPanel} with `omitBg` on an `aiMode` {@link StepperLayout}. */
export function WithAiLoadingPanel() {
  return (
    <WithEnvironmentBanner>
      <StepperLayout
        title="Import Materials"
        aiMode
        defaultStep="importing"
        onCancel={action("cancel clicked")}
        completeLabel="Save"
        onComplete={action("complete clicked")}
        steps={[
          {
            label: "Details",
            content: (
              <FormSectionLayout
                aiMode
                title="Import Details"
                description="Connect a source and we'll pull in the details."
                sections={[{ title: "Source", fields: <JumpLinkPlaceholderFields count={2} /> }]}
              />
            ),
          },
          {
            label: "Importing",
            primaryDisabled: "Import is still running.",
            content: (
              <CenteredLayout size="sm">
                <AiLoadingPanel omitBg />
              </CenteredLayout>
            ),
          },
        ]}
      />
    </WithEnvironmentBanner>
  );
}

/** A table step: {@link ContentHeader} above `GridTableLayout`. */
export function WithContentHeaderAndTable() {
  return (
    <WithEnvironmentBanner>
      <StepperLayout
        title="Trade Partners"
        onCancel={action("cancel clicked")}
        completeLabel="Save"
        onComplete={action("complete clicked")}
        steps={[
          {
            label: "Trade Partners",
            content: (
              <div>
                <ContentHeader
                  title="Trade Partners"
                  description="Assign and manage trade partners for this project."
                  actions={[{ label: "Add", onClick: action("add clicked") }]}
                  xss={pageContentPaddingX}
                />
                <GridTableLayoutExample storageKey="stepper-layout-grid-table" />
              </div>
            ),
          },
        ]}
      />
    </WithEnvironmentBanner>
  );
}

/** Form step with JumpLinks on {@link FormSectionLayout} — Stepper itself does not own the rail. */
export function WithJumpLinks() {
  return (
    <WithEnvironmentBanner>
      <StepperLayout
        title="Create Design Package"
        onCancel={action("cancel clicked")}
        completeLabel="Create"
        onComplete={action("complete clicked")}
        steps={[
          {
            label: "Details",
            content: (
              <FormSectionLayout
                withJumpLinks
                title="Link Design Package"
                description="Connect this package to a market and give it a name."
                sections={[
                  {
                    title: "Setup",
                    description: "Basic package details.",
                    fields: <JumpLinkPlaceholderFields count={2} />,
                  },
                  { title: "Package Options", fields: <JumpLinkPlaceholderFields count={3} /> },
                  {
                    title: "Internal",
                    excludeJumpLink: true,
                    fields: <JumpLinkPlaceholderFields count={1} />,
                  },
                ]}
              />
            ),
          },
          {
            label: "Review",
            content: (
              <FormSectionLayout
                title="Review"
                description="Confirm before creating."
                sections={[{ title: "Summary", fields: <JumpLinkPlaceholderFields count={2} /> }]}
              />
            ),
          },
        ]}
      />
    </WithEnvironmentBanner>
  );
}

function WithEnvironmentBanner({ children }: { children: ReactNode }) {
  return <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>{children}</EnvironmentBannerLayout>;
}

function JumpLinkPlaceholderFields({ count }: { count: number }) {
  return (
    <div css={Css.df.fdc.gap1.$}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} css={Css.hPx(36).br4.bgColor(Tokens.SurfaceSeparator).$} />
      ))}
    </div>
  );
}
