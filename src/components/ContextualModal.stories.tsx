import { Meta } from "@storybook/react";
import { Css } from "../Css";
import { ContextualModal } from "./ConTextualModal";

export default {
  component: ContextualModal,
  title: "Workspace/Components/ContextualModal",
} as Meta;

export function ContextualModalWithTitle() {
  return (
    <div css={Css.df.fdc.$}>
      <h2 css={Css.lg.$}>Contextual Modal with a title</h2>
      <ContextualModal
        content={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, " +
          "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Enim nulla aliquet porttitor lacus luctus accumsan tortor posuere. Aliquam ultrices sagittis orci a scelerisque purus. " +
          "Tellus in metus vulputate eu scelerisque. Sed libero enim sed faucibus turpis in eu. Rhoncus dolor purus non enim praesent elementum facilisis leo."
        }
        title={"Modal Title"}
      />
    </div>
  );
}

export function ContextualModalWithoutTitle() {
  return (
    <div css={Css.df.fdc.$}>
      <h2 css={Css.lg.mtPx(150).$}>Contextual Modal without a title</h2>
      <ContextualModal
        content={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Enim nulla aliquet porttitor lacus luctus accumsan tortor posuere. Aliquam ultrices sagittis orci a scelerisque purus. Tellus in metus vulputate eu scelerisque. Sed libero enim sed faucibus turpis in eu. Rhoncus dolor purus non enim praesent elementum facilisis leo. Tincidunt praesent semper feugiat nibh sed pulvinar. Sem fringilla ut morbi tincidunt augue interdum velit euismod. Et ultrices neque ornare aenean euismod elementum nisi quis. Fringilla ut morbi tincidunt augue interdum velit euismod. Diam ut venenatis tellus in metus vulputate eu scelerisque. Mauris cursus mattis molestie a iaculis at erat. Sed tempus urna et pharetra pharetra massa. Ligula ullamcorper malesuada proin libero nunc consequat. Eu mi bibendum neque egestas congue quisque. Consequat id porta nibh venenatis cras sed felis eget velit."
        }
      />
    </div>
  );
}
