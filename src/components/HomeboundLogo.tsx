import { BeamColor } from "src/colors";
import { Css } from "src/Css";

type HomeboundLogoProps = {
  fill?: BeamColor;
  width?: number | "auto";
  height?: number | "auto";
};

export function HomeboundLogo(props: HomeboundLogoProps) {
  const { fill = "currentColor", width = "auto", height = "auto" } = props;
  return (
    <svg viewBox="0 0 158.1 97.6" xmlns="http://www.w3.org/2000/svg" css={Css.fill(fill).w(width).h(height).$}>
      <path d="M158.1,97.6H0.2L0,39.7L76.8,0l68,38.7l-3.1,5.3l-65-37L6.2,43.4l0.2,48h151.7V97.6z" />
    </svg>
  );
}
