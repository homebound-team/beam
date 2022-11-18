import { Loader } from "src/components";
import { Css } from "src/Css";

export default {
  component: Loader,
  title: "Workspace/Components/Loader",
};

function Loaders(contrast: boolean = false) {
  return (
    <div css={Css.df.fdc.gap3.$}>
      <Loader contrast={contrast} size="xs" />
      <Loader contrast={contrast} size="sm" />
      <Loader contrast={contrast} size="md" />
      <Loader contrast={contrast} />
    </div>
  );
}

export const Regular = () => Loaders();
export const Contrast = () => Loaders(true);
Contrast.parameters = { backgrounds: { default: "dark" } };
