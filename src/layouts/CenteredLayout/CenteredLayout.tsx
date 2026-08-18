import { ReactNode } from "react";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

const centeredMaxWidthPx = { sm: 768, lg: 1440 } as const;

export type CenteredLayoutSize = keyof typeof centeredMaxWidthPx;

export type CenteredLayoutProps = {
  /** `sm` = 720px content (768 outer); `lg` = 1440px outer (1392 content at md+). */
  size: CenteredLayoutSize;
  children?: ReactNode;
};

/** Centered body-width shell. Nest inside page-header / workflow children — see `docs/layouts.md`. */
export function CenteredLayout(props: CenteredLayoutProps) {
  const { size, children } = props;
  const tid = useTestIds(props, "centeredLayout");

  return (
    <div css={Css.w100.maxwPx(centeredMaxWidthPx[size]).mxa.pxPx(12).ifMdAndUp.px3.$} {...tid}>
      {children}
    </div>
  );
}
