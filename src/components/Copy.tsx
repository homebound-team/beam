import { ReactNode } from "react";
import { Css } from "src/Css";

export function Copy(props: { children: string | ReactNode }) {
  return (
    <div
      css={{
        ...Css.sm.gray700.mt2.mb3.wPx(480).$,
        "& > p": Css.my2.$,
      }}
    >
      {props.children}
    </div>
  );
}
