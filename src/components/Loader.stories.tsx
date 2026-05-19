import { ContrastScope, Loader } from "src/components";
import { Css } from "src/Css";

export default {
  component: Loader,
};

function Loaders() {
  return (
    <div css={Css.df.fdc.gap3.$}>
      <Loader size="xs" />
      <Loader size="sm" />
      <Loader size="md" />
      <Loader />
    </div>
  );
}

export const Regular = () => Loaders();
export const Contrast = () => (
  <ContrastScope>
    <Loaders />
  </ContrastScope>
);
Contrast.globals = { backgrounds: { value: "dark" } };
