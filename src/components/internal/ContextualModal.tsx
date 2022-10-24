import { ReactNode } from "react";
import { FocusScope } from "react-aria";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

export interface ContextualModalProps {
  content: ReactNode;
  title?: string;
}

export function ContextualModal(props: ContextualModalProps) {
  const { content, title } = props;
  const tid = useTestIds(props, "popup");
  return (
    <FocusScope restoreFocus autoFocus>
      <div css={Css.p3.df.fdc.myPx(4).gap3.bgWhite.bshModal.br4.maxh("inherit").overflowAuto.$}>
        {title && (
          <div css={Css.lg.tc.$} {...tid.title}>
            {title}
          </div>
        )}
        <div {...tid.content}>{content}</div>
      </div>
    </FocusScope>
  );
}
