import { ReactNode } from "react";
import { FocusScope } from "react-aria";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

export interface ContextualModalProps {
  content: ReactNode;
  title?: string;
  close: () => void;
}

export function ContextualModal(props: ContextualModalProps) {
  const { content, title, close } = props;
  const tid = useTestIds(props, "popup");
  return (
    <FocusScope restoreFocus autoFocus>
      <div css={Css.p3.df.fdc.gap3.bgWhite.bshModal.br4.maxh("inherit").overflowAuto.$} {...tid}>
        {title && (
          <div css={Css.lg.tc.$} {...tid.title}>
            {title}
          </div>
        )}
        <div {...tid.content}>{typeof content === "function" ? content(close) : content}</div>
      </div>
    </FocusScope>
  );
}
