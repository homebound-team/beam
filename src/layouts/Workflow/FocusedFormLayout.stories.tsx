import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { Button } from "src/components/Button";
import { RightPane } from "src/components/Layout/RightPaneLayout/RightPane";
import { RightPanePanel } from "src/components/Layout/RightPaneLayout/RightPanePanel";
import { useRightPane } from "src/components/Layout/RightPaneLayout/useRightPane";
import { Css, Tokens } from "src/Css";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
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
        isValid
        form={{
          title: "Link Design Package",
          description: "Connect this package to a market and give it a name.",
          sections: createSections(),
        }}
      />
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
        isValid
        withJumpLinks={false}
        form={{
          title: "Link Design Package",
          description: "Connect this package to a market and give it a name.",
          sections: createSections(),
        }}
      />
    </WithEnvironmentBanner>
  );
}

export function AiMode() {
  return (
    <WithEnvironmentBanner>
      <FocusedFormLayout
        title="Create Design Package"
        onCancel={action("cancel clicked")}
        completeLabel="Create"
        onComplete={action("complete clicked")}
        isValid
        aiMode
        form={{
          title: "Link Design Package",
          description: "Connect this package to a market and give it a name.",
          sections: createSections(),
        }}
      />
    </WithEnvironmentBanner>
  );
}

/** Default `auto` mode: push or clear spacer based on chrome width; open via in-form button. */
export function WithRightPane() {
  return (
    <WithEnvironmentBanner>
      <FocusedFormLayout
        title="Create Design Package"
        onCancel={action("cancel clicked")}
        completeLabel="Create"
        onComplete={action("complete clicked")}
        isValid
        withRightPane
        form={{
          title: "Link Design Package",
          description: "Connect this package to a market and give it a name.",
          sections: createRightPaneSections(),
        }}
      />
    </WithEnvironmentBanner>
  );
}

/** Floating trigger + built-in close (Change Event–style). */
export function WithFloatingRightPaneTrigger() {
  return (
    <WithEnvironmentBanner>
      <FocusedFormLayout
        title="Create Change Event"
        onCancel={action("cancel clicked")}
        completeLabel="Submit"
        onComplete={action("complete clicked")}
        isValid
        withRightPane
        form={{
          title: "Ready to Submit",
          description: "Review the summary of changes below.",
          sections: createFloatingTriggerSections(),
        }}
      />
      <RightPane title="Comments" trigger={{ icon: "comment", label: "Comments" }}>
        <p css={Css.sm.color(Tokens.OnSurfaceMuted).$}>Add a comment…</p>
        <p css={Css.sm.mt2.$}>Sample comment thread content for the floating trigger demo.</p>
      </RightPane>
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

function createRightPaneSections() {
  return [
    { title: "Setup", description: "Basic package details.", fields: <OpenRightPaneFields /> },
    { title: "Package Options", fields: <PlaceholderFields count={3} /> },
    { title: "Internal", excludeJumpLink: true, fields: <PlaceholderFields count={1} /> },
  ];
}

function OpenRightPaneFields() {
  const { openRightPane } = useRightPane();
  return (
    <div css={Css.df.fdc.gap1.$}>
      <PlaceholderFields count={2} />
      <Button
        label="Open detail pane"
        onClick={() =>
          openRightPane({
            content: (
              <RightPanePanel title="Package detail">
                <p css={Css.sm.color(Tokens.OnSurfaceMuted).$}>
                  Independent pane scroll. Desktop uses `auto` (push or no spacer when the form clears the pane); on
                  mobile it is a full-bleed overlay below the environment banner.
                </p>
              </RightPanePanel>
            ),
          })
        }
      />
    </div>
  );
}

function createFloatingTriggerSections() {
  return [
    { title: "Summary", fields: <PlaceholderFields count={4} /> },
    { title: "Approvals", fields: <PlaceholderFields count={2} /> },
  ];
}
