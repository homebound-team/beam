import { ReactNode } from "react";
import { IconButtonProps } from "src/components/IconButton";
import { RightPanePanel } from "./RightPanePanel";
import { RightPaneTrigger } from "./RightPaneTrigger";
import { useRightPane } from "./useRightPane";

export type RightPaneProps = {
  title: string;
  children: ReactNode;
  /**
   * Optional floating trigger. When omitted, open the pane imperatively
   * (`openRightPane({ content: <RightPanePanel … /> })`) from rows or other controls.
   */
  trigger?: {
    icon: IconButtonProps["icon"];
    label: string;
    topPx?: number;
  };
  /** When false, omit the built-in close control on the panel. Default true. */
  withClose?: boolean;
};

/**
 * Optional floating trigger + pane chrome. Renders the trigger when closed; opens a
 * {@link RightPanePanel} via `useRightPane`. See `docs/layouts.md`.
 */
export function RightPane(props: RightPaneProps) {
  const { title, children, trigger, withClose } = props;
  const { openRightPane } = useRightPane();

  const open = () => {
    openRightPane({
      content: (
        <RightPanePanel title={title} withClose={withClose}>
          {children}
        </RightPanePanel>
      ),
    });
  };

  if (!trigger) return null;

  return <RightPaneTrigger icon={trigger.icon} label={trigger.label} topPx={trigger.topPx} onClick={open} />;
}
