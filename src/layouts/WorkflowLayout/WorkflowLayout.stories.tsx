import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { WorkflowLayoutFormApp } from "src/forms/WorkflowLayoutFormApp";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { GridTableLayoutExample } from "src/utils/sbComponents";
import { action } from "storybook/actions";
import { pageContentPaddingX } from "../layoutSpacing";
import { WorkflowLayout } from "./WorkflowLayout";

export default {
  component: WorkflowLayout,
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
      <WorkflowLayoutFormApp />
    </WithEnvironmentBanner>
  );
}

/** Same form as {@link WithFormSectionLayout}, with `aiMode` on the workflow and form layout. */
export function AiMode() {
  return (
    <WithEnvironmentBanner>
      <WorkflowLayoutFormApp aiMode />
    </WithEnvironmentBanner>
  );
}

/** A table step: {@link ContentHeader} above `GridTableLayout`. */
export function WithContentHeaderAndTable() {
  return (
    <WithEnvironmentBanner>
      <WorkflowLayout
        title="Trade Partners"
        onCancel={action("cancel clicked")}
        completeLabel="Save"
        onComplete={action("complete clicked")}
        steps={[
          {
            label: "Trade Partners",
            isValid: true,
            content: (
              <div>
                <ContentHeader
                  title="Trade Partners"
                  description="Assign and manage trade partners for this project."
                  actions={[{ label: "Add", onClick: action("add clicked") }]}
                  xss={pageContentPaddingX}
                />
                <GridTableLayoutExample storageKey="workflow-layout-grid-table" />
              </div>
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
