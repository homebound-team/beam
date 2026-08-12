import { ReactNode } from "react";
import { AiPanel, AiPanelVariant } from "src/components/AiPanel";
import { useTestIds } from "src/utils";

export type ImportBannerProps = {
  title?: string;
  message?: ReactNode;
  variant?: AiPanelVariant;
};

/** Tells the user an AI import is running, and that they're free to go do something else. */
export function ImportBanner(props: ImportBannerProps) {
  const { title = "Importing Details...", message = defaultMessage, variant = "banner" } = props;
  const tid = useTestIds(props, "importBanner");
  return <AiPanel align="center" variant={variant} loading title={title} message={message} {...tid} />;
}

const defaultMessage =
  "This process can take a few minutes. Feel free to keep working in another tab. Once imported, you may edit or add to content before saving.";
