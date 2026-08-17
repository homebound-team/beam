import { ReactNode } from "react";
import { AiLoader } from "src/components/AiLoader";
import { AiPanel } from "src/components/AiPanel";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type AiImportingProps = {
  title?: string;
  message?: ReactNode;
};

/**
 * Tells the user an AI import is running, and that they're free to go do something else.
 *
 * Indeterminate — imports don't report progress, so this never shows a percentage or ETA.
 */
export function AiImporting(props: AiImportingProps) {
  const { title = "Importing Details...", message = defaultMessage } = props;
  const tid = useTestIds(props, "aiImporting");
  return (
    // `status` rather than `alert` so assistive tech waits for a pause instead of interrupting, and
    // `aria-busy` so it knows the surrounding content is still settling.
    <AiPanel role="status" aria-busy={true} {...tid}>
      <div css={Css.df.fdc.aic.gap1.w100.$}>
        <AiLoader />
        <span css={Css.lg.aiBoldText.$} {...tid.title}>
          {title}
        </span>
        <span css={Css.sm.color(Tokens.OnSurface).tac.$} {...tid.message}>
          {message}
        </span>
      </div>
    </AiPanel>
  );
}

const defaultMessage =
  "This process can take a few minutes. Feel free to keep working in another tab. Once imported, you may edit or add to content before saving.";
