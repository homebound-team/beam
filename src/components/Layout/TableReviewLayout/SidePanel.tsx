import { Button } from "src/components/Button";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";
import type { SidePanelProps } from "./TableReviewLayout";

export function SidePanel(props: SidePanelProps) {
  const { title, content, primaryAction, secondaryAction } = props;
  const tid = useTestIds(props, "sidePanel");
  const hasFooter = primaryAction || secondaryAction;

  return (
    <div css={Css.h100.df.fdc.oh.$} {...tid}>
      <div css={Css.p3.fs0.$} {...tid.header}>
        <h2 css={Css.xl.my0.$} {...tid.title}>
          {title}
        </h2>
      </div>
      <div css={Css.fg1.oya.mh0.$} {...tid.body}>
        {content}
      </div>
      {hasFooter && (
        <div css={Css.df.gap2.jcfe.p3.fs0.$} {...tid.footer}>
          {secondaryAction && <Button {...secondaryAction} variant="secondaryBlack" />}
          {primaryAction && <Button {...primaryAction} />}
        </div>
      )}
    </div>
  );
}
