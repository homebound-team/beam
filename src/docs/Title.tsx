import { PropsWithChildren } from "react";
import { Css } from "src/Css";

export function Title({ children }: PropsWithChildren<{}>) {
  return <h1 css={Css.xl2.$}>{children}</h1>;
}
