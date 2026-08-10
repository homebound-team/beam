import { BeamColor } from "src/colors";
import { Css } from "src/Css";

type BeamLogoProps = {
  fill?: BeamColor;
  // Defaults to 500
  width?: number | "auto";
  height?: number | "auto";
};

export function BeamLogo(props: BeamLogoProps) {
  const { fill = "currentColor", width = "500", height = "500" } = props;
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" css={Css.fill(fill).w(width).h(height).$}>
      <rect x="10" y="90" width="32" height="320" />
      <rect x="122" y="172" width="32" height="158" />
      <rect x="346" y="172" width="32" height="158" />
      <rect x="458" y="90" width="32" height="320" />
      <rect x="10" y="90" width="480" height="32" />
      <rect x="10" y="378" width="480" height="32" />
      <rect x="10" y="172" width="480" height="32" />
      <rect x="10" y="298" width="480" height="32" />
    </svg>
  );
}
