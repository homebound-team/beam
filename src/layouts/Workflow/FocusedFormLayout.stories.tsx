import type { Meta } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { RightPanePanel } from "src/components/Layout/RightPaneLayout/RightPanePanel";
import { useRightPaneActions } from "src/components/Layout/RightPaneLayout/useRightPane";
import type { PageBannerProps } from "src/components/StatusBanner/StatusBanner";
import { Css, Tokens } from "src/Css";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { FocusedFormLayout } from "src/layouts/Workflow/FocusedFormLayout";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { createFormSections, createRightPaneTriggers } from "src/utils/sbComponents";
import { action } from "storybook/actions";

export default {
  title: "Layouts/Workflows/Focused Form",
  component: FocusedFormLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} satisfies Meta;

/** Env banner → `FocusedFormLayout` → `FormSectionLayout` with JumpLinks and a body-hosted right pane. */
export function Default() {
  return (
    <WorkflowChrome>
      <FocusedFormBody />
    </WorkflowChrome>
  );
}

/** Layout-level Comments / History triggers — do not also set `withRightPane` on the body. */
export function WithRightPaneTriggers() {
  return (
    <WorkflowChrome rightPaneTriggers={createRightPaneTriggers()}>
      <FormSectionLayout
        withJumpLinks
        title="Link Design Package"
        description="Connect this package to a market and give it a name."
        sections={createFormSections()}
      />
    </WorkflowChrome>
  );
}

/** Stay-pinned page banner under the workflow header. */
export function WithBanner() {
  return (
    <WorkflowChrome
      banner={{
        type: "info",
        title: "Updated Costs Ready",
        description: "Updated calculations are ready for 632 configurations.",
      }}
    >
      <FocusedFormBody />
    </WorkflowChrome>
  );
}

/** `aiMode` on both the workflow chrome and the form body. */
export function AiMode() {
  return (
    <WorkflowChrome aiMode>
      <FormSectionLayout
        aiMode
        withJumpLinks
        title="Link Design Package"
        description="Connect this package to a market and give it a name."
        sections={createFormSections()}
      />
    </WorkflowChrome>
  );
}
AiMode.storyName = "AI Mode";

function WorkflowChrome({
  children,
  ...props
}: {
  children: ReactNode;
  aiMode?: boolean;
  banner?: PageBannerProps;
  rightPaneTriggers?: ReturnType<typeof createRightPaneTriggers>;
}) {
  return (
    <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>
      <FocusedFormLayout
        title="Create Design Package"
        onCancel={action("cancel clicked")}
        completeLabel="Create"
        onComplete={action("complete clicked")}
        {...props}
      >
        {children}
      </FocusedFormLayout>
    </EnvironmentBannerLayout>
  );
}

function FocusedFormBody() {
  const { openRightPane } = useRightPaneActions();
  return (
    <FormSectionLayout
      withJumpLinks
      withRightPane
      title="Link Design Package"
      description="Connect this package to a market and give it a name."
      actions={[
        {
          label: "Open right pane",
          variant: "secondary",
          onClick: () =>
            openRightPane({
              content: (
                <RightPanePanel title="Package detail">
                  <p css={Css.sm.color(Tokens.OnSurfaceMuted).$}>
                    Document-scroll pane hosted by the form body; close from the pane header.
                  </p>
                </RightPanePanel>
              ),
            }),
        },
      ]}
      sections={createFormSections()}
    />
  );
}
