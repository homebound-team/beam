import type { IconKey } from "src/components/Icon";
import type { BannerType } from "src/components/StatusBanner/StatusBanner";
import { Css, Palette, type Properties } from "src/Css";

type BannerTypeStyles = {
  /** Inline fill. */
  background: Properties;
  /** Inline 2px outline. */
  border: Properties;
  stickyBackground: Properties;
  iconColor: Palette;
  defaultIcon: IconKey;
};

/** Banner fills differ from Tag's, so these stay local rather than shared. */
export const bannerTypeStyles: Record<BannerType, BannerTypeStyles> = {
  info: {
    background: Css.bgBlue50.$,
    border: Css.ba.bw2.bcBlue300.$,
    stickyBackground: Css.bgBlue100.$,
    iconColor: Palette.Blue600,
    defaultIcon: "infoCircle",
  },
  update: {
    background: Css.bgYellow50.$,
    border: Css.ba.bw2.bcYellow300.$,
    stickyBackground: Css.bgYellow50.$,
    iconColor: Palette.Yellow700,
    defaultIcon: "refresh",
  },
  warning: {
    background: Css.bgOrange50.$,
    border: Css.ba.bw2.bcOrange300.$,
    stickyBackground: Css.bgOrange100.$,
    iconColor: Palette.Orange700,
    defaultIcon: "error",
  },
  error: {
    background: Css.bgRed50.$,
    border: Css.ba.bw2.bcRed300.$,
    stickyBackground: Css.bgRed50.$,
    iconColor: Palette.Red600,
    defaultIcon: "errorCircle",
  },
  success: {
    background: Css.bgGreen50.$,
    border: Css.ba.bw2.bcGreen300.$,
    stickyBackground: Css.bgGreen50.$,
    iconColor: Palette.Green600,
    defaultIcon: "checkCircle",
  },
};
