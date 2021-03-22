import { PressEvent } from "@react-types/shared";
import { ReactNode } from "react";

export interface BeamButtonProps {
  /** Whether the button is disabled. */
  isDisabled?: boolean;
  /** Handler that is called when the press is released over the target. */
  onPress?: (e: PressEvent) => void;
}

export interface BeamFocusableProps {
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean;
}

export interface BeamButtonWithChildrenProps extends BeamButtonProps {
  /** The content to display in the button. */
  children?: ReactNode;
}
