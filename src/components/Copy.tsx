import { ReactNode } from "react";
import { Css } from "src/Css";
import "./Copy.css";

export function Copy(props: { children: string | ReactNode }) {
  return (
    <div
      className="beam-copy"
      css={{
        ...Css.sm.gray700.mt2.mb3.wPx(480).$,
      }}
    >
      {props.children}
    </div>
  );
}
