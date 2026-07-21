import { ReactNode } from "react";
import { Css, Tokens } from "src/Css";
import "./Copy.css";

export function Copy(props: { children: string | ReactNode }) {
  return (
    <div
      className="beam-copy"
      css={{
        ...Css.sm.color(Tokens.OnSurfaceMuted).mt2.mb3.wPx(480).$,
      }}
    >
      {props.children}
    </div>
  );
}
