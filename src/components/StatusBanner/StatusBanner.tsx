import type { ReactNode } from "react";
import type { IconKey } from "src/components/Icon";
import type { ActionButtonProps } from "src/components/Layout/layoutTypes";
import { BannerAccordion } from "src/components/StatusBanner/internal/BannerAccordion";
import { BannerRow } from "src/components/StatusBanner/internal/BannerRow";
import { bannerTypeStyles } from "src/components/StatusBanner/internal/bannerTypeStyles";
import { Css } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type BannerType = "info" | "update" | "warning" | "error" | "success";

/** Single-row banner content; also what a layout's pinned banner slot accepts. */
export type PageBannerProps = {
  type: BannerType;
  /** Overrides the type's default icon; the type still sets its color. */
  icon?: IconKey;
  title: string;
  description?: ReactNode;
  primaryAction?: ActionButtonProps;
  secondaryAction?: ActionButtonProps;
};

/** One detail row inside an expanded banner. */
export type BannerItemProps = {
  title: string;
  description?: ReactNode;
  /** Rendered as secondary buttons. */
  actions?: ActionButtonProps[];
};

type InlineBannerProps = PageBannerProps & {
  sticky?: false;
  /** When set, the banner expands to these rows instead of staying a single line. */
  items?: BannerItemProps[];
  /** Starts `items` open. Ignored when `items` is omitted. */
  defaultExpanded?: boolean;
};

type StickyBannerProps = PageBannerProps & {
  /** Fill-only chrome. Set by the layout slot. */
  sticky: true;
};

export type StatusBannerProps = InlineBannerProps | StickyBannerProps;

/** Status banner. Inline by default; `sticky` is the layout slot's fill-only chrome. Pass `items` for an accordion. */
export function StatusBanner(props: StatusBannerProps) {
  const tid = useTestIds(props, "banner");
  const { background, border, stickyBackground } = bannerTypeStyles[props.type];

  if (props.sticky) {
    return (
      <div css={{ ...stickyBackground, ...Css.w100.p2.$ }} role="status" {...tid}>
        <BannerRow {...props} {...tid} />
      </div>
    );
  }

  if (props.items && props.items.length > 0) return <BannerAccordion {...props} items={props.items} {...tid} />;

  return (
    <div css={{ ...background, ...border, ...Css.w100.p2.br12.$ }} role="status" {...tid}>
      <BannerRow {...props} {...tid} />
    </div>
  );
}
