import { ReactNode } from "react";
import { Css } from "src/Css";

interface ContextualModalProps {
  content: ReactNode;
  title?: string;
}

export function ContextualModal(props: ContextualModalProps) {
  const { content, title } = props;
  return (
    <div css={Css.p3.df.fdc.gap3.bgWhite.ba.bGray400.bshModal.$}>
      <div css={Css.lg.$}>{title}</div>
      <div>{content}</div>
    </div>
  );
}
