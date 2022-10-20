import { FocusScope } from "react-aria";
import { Css } from "src/Css";
import { useTestIds } from "../../utils";
import { WithContextualModalProps } from "../ButtonMenu";

export function ContextualModal(props: WithContextualModalProps) {
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
