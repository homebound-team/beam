import type { Meta } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { AiLoadingPanel } from "src/components/AiLoadingPanel";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { Css } from "src/Css";
import { StepperLayoutFormApp } from "src/forms/StepperLayoutFormApp";
import { CenteredLayout } from "src/layouts/CenteredLayout/CenteredLayout";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { StepperLayout } from "src/layouts/Workflow/StepperLayout";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import {
  createFormSections,
  createRightPaneTriggers,
  GridTableLayoutExample,
  PlaceholderFields,
} from "src/utils/sbComponents";
import { action } from "storybook/actions";

export default {
  title: "Layouts/Workflows/Stepper",
  component: StepperLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} satisfies Meta;

/** Interactive form-state steps in `FormSectionLayout`, under an environment banner. */
export function WithFormSections() {
  return (
    <WorkflowChrome>
      <StepperLayoutFormApp />
    </WorkflowChrome>
  );
}

/** Same interactive steps with `aiMode` on the workflow and each form body. */
export function AiMode() {
  return (
    <WorkflowChrome>
      <StepperLayoutFormApp aiMode />
    </WorkflowChrome>
  );
}
AiMode.storyName = "AI Mode";

/** Loading step: `AiLoadingPanel` with `omitBg` on an `aiMode` stepper. */
export function WithAiLoadingPanel() {
  return (
    <WorkflowChrome>
      <StepperLayout
        aiMode
        title="Import Materials"
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
                sections={[{ title: "Source", fields: <PlaceholderFields count={2} /> }]}
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
    </WorkflowChrome>
  );
}
WithAiLoadingPanel.storyName = "With AI Loading Panel";

/** Table step: `ContentHeader` above `GridTableLayout`; row click opens the document-scroll pane. */
export function WithTable() {
  return (
    <WorkflowChrome>
      <StepperLayout
        title="Trade Partners"
        onCancel={action("cancel clicked")}
        completeLabel="Save"
        onComplete={action("complete clicked")}
        steps={[
          {
            label: "Trade Partners",
            content: (
              <div css={Css.df.fdc.gap3.$}>
                <ContentHeader
                  title="Trade Partners"
                  description="Assign and manage trade partners for this project."
                  actions={[{ label: "Add", onClick: action("add clicked") }]}
                />
                <GridTableLayoutExample storageKey="layouts-stepper-table" withRightPane />
              </div>
            ),
          },
        ]}
      />
    </WorkflowChrome>
  );
}

/** Per-step Comments / History triggers — the pane closes when the step changes. */
export function WithRightPaneTriggers() {
  return (
    <WorkflowChrome>
      <StepperLayout
        title="Create Design Package"
        onCancel={action("cancel clicked")}
        completeLabel="Create"
        onComplete={action("complete clicked")}
        steps={[
          {
            label: "Details",
            rightPaneTriggers: createRightPaneTriggers(),
            content: (
              <FormSectionLayout
                withJumpLinks
                title="Link Design Package"
                description="Connect this package to a market and give it a name."
                sections={createFormSections()}
              />
            ),
          },
          {
            label: "Review",
            content: (
              <FormSectionLayout
                title="Review"
                description="Confirm before creating."
                sections={[{ title: "Summary", fields: <PlaceholderFields count={2} /> }]}
              />
            ),
          },
        ]}
      />
    </WorkflowChrome>
  );
}

function WorkflowChrome({ children }: { children: ReactNode }) {
  return <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>{children}</EnvironmentBannerLayout>;
}
