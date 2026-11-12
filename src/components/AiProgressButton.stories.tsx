import type { Meta } from "@storybook/react-vite";
import { AiProgressButton, type AiProgressButtonProps } from "src/components/AiProgressButton";
import { Button } from "src/components/Button";
import { ButtonMenu } from "src/components/ButtonMenu";
import { Css } from "src/Css";
import { LabeledExamples, withRouter } from "src/utils/sb";
import { action } from "storybook/actions";
import { userEvent, waitFor, within } from "storybook/test";

export default {
  component: AiProgressButton,
  decorators: [withRouter()],
} as Meta;

export function Default() {
  return (
    <div css={Css.df.fdc.aifs.gap1.$}>
      <div css={Css.df.aic.gap1.$}>
        <Sample />
        <Button label="Primary" onClick={action("Primary")} />
        <ButtonMenu
          trigger={{ icon: "verticalDots" }}
          items={[
            { label: "Edit", onClick: action("Edit") },
            { label: "Duplicate", onClick: action("Duplicate") },
            { label: "Delete", onClick: action("Delete") },
          ]}
        />
      </div>
      <span css={Css.xs.gray600.$}>Hover or tab to it</span>
    </div>
  );
}

export function Hovered() {
  return <Sample />;
}
Hovered.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  return waitFor(() => userEvent.hover(canvas.getByTestId("viewImportProgress")));
};

export function Focused() {
  return <Sample />;
}
Focused.play = async () => userEvent.tab();

export function States() {
  return (
    <LabeledExamples
      examples={[
        { label: "In progress", children: <Sample /> },
        { label: "Idle", children: <Sample inProgress={false} /> },
        { label: "Disabled", children: <Sample inProgress={false} disabled="No import is running" /> },
      ]}
    />
  );
}

export function Sizes() {
  return (
    <LabeledExamples
      examples={[
        { label: "sm", children: <Sample size="sm" /> },
        { label: "md", children: <Sample size="md" /> },
        { label: "lg", children: <Sample size="lg" /> },
      ]}
    />
  );
}

/** Leading the action group, it grows left into the header's free space without nudging its neighbors. */
export function InPageHeader() {
  return (
    <div css={Css.df.aic.jcsb.gap2.p3.bgWhite.$}>
      <h1 css={Css.xl.$}>The Conroy · Plan 2401</h1>
      <div css={Css.df.aic.gap1.$}>
        <Sample />
        <Button variant="secondary" label="Export" onClick={action("Export")} />
        <Button label="Publish" onClick={action("Publish")} />
      </div>
    </div>
  );
}

function Sample(props: Partial<AiProgressButtonProps>) {
  return <AiProgressButton label="View import Progress" inProgress onClick={action("Clicked")} {...props} />;
}
