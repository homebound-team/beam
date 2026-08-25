import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { Button } from "src/components/Button";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { RightPanePanel } from "src/components/Layout/RightPaneLayout/RightPanePanel";
import { useRightPane } from "src/components/Layout/RightPaneLayout/useRightPane";
import { Css, Tokens } from "src/Css";
import { StepperLayoutFormApp } from "src/forms/StepperLayoutFormApp";
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
            isValid: true,
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

/**
 * Per-step right pane: form step uses `FormSectionLayout withRightPane` (auto);
 * table step uses `GridTableLayout withRightPane` (overlay). Stepper itself has no `withRightPane`.
 */
export function WithRightPanePerStep() {
  return (
    <WithEnvironmentBanner>
      <StepperLayout
        title="Create Package"
        onCancel={action("cancel clicked")}
        completeLabel="Create"
        onComplete={action("complete clicked")}
        steps={[
          {
            label: "Details",
            isValid: true,
            content: (
              <FormSectionLayout
                title="Package details"
                description="Form step hosts its own right pane (auto mode)."
                withRightPane
                sections={[
                  {
                    title: "Setup",
                    fields: <OpenRightPaneInStep />,
                  },
                ]}
              />
            ),
          },
          {
            label: "Items",
            isValid: true,
            content: (
              <div>
                <ContentHeader
                  title="Package items"
                  description="Table step hosts overlay right pane on the table body only."
                  xss={pageContentPaddingX}
                />
                <GridTableLayoutExample storageKey="stepper-layout-right-pane-table" withRightPane />
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

function OpenRightPaneInStep() {
  const { openRightPane } = useRightPane();
  return (
    <div css={Css.df.fdc.gap2.$}>
      <div css={Css.hPx(36).br4.bgColor(Tokens.SurfaceSeparator).$} />
      <Button
        label="Open detail pane"
        onClick={() =>
          openRightPane({
            content: (
              <RightPanePanel title="Step detail">
                <p css={Css.sm.color(Tokens.OnSurfaceMuted).$}>Opened from a FormSectionLayout withRightPane step.</p>
              </RightPanePanel>
            ),
          })
        }
      />
    </div>
  );
}
