import { ReactNode } from "react";
import { IconButton } from "src/components/IconButton";
import { Css, Tokens } from "src/Css";
import { BeamButtonProps } from "src/interfaces";
import { useTestIds } from "src/utils";

export type LinkCardProps = {
  title: string;
  /** Supporting copy, i.e. a `ReactNode` so it can carry its own inline links as needed. */
  message?: ReactNode;
  action: Pick<BeamButtonProps, "onClick" | "openInNew">;
};

/**
 * A raised card that summarizes something and links to it via a trailing arrow.
 *
 * Only the arrow is interactive, so `message` is free to hold its own links.
 */
export function LinkCard(props: LinkCardProps) {
  const { title, message, action } = props;
  const tid = useTestIds(props, "linkCard");
  return (
    <div
      // Line up the arrow with the title when there's no message.
      css={Css.df.ais.gap2.w100.p2.br16.bgColor(Tokens.Surface).bshBasic.if(!message).aic.$}
      {...tid}
    >
      <div css={Css.df.fdc.gapPx(4).fg1.mw0.wbbw.$}>
        <span css={Css.smSb.color(Tokens.OnSurface).$} {...tid.title}>
          {title}
        </span>
        {message && (
          <span css={Css.xs.color(Tokens.OnSurface).$} {...tid.message}>
            {message}
          </span>
        )}
      </div>
      <div css={Css.df.aic.fs0.hPx(40).$}>
        <IconButton
          icon="arrowRight"
          color={Tokens.TextLinkDefault}
          {...action}
          label={title}
          preventTooltip
          {...tid.action}
        />
      </div>
    </div>
  );
}
