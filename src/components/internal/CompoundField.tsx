import { useState } from "react";
import { Css } from "src/Css";
import { TextFieldInternalProps } from "src/interfaces";
import { maybeCall } from "src/utils";

/** Internal component to help create compound fields */
export function CompoundField({ children }: { children: JSX.Element[] }) {
  if (children?.length !== 2) {
    throw global.Error("CompoundField requires two children components");
  }
  const [focusedEl, setFocusedEl] = useState<"left" | "right" | undefined>();
  const commonStyles = Css.df.aic.fs1.maxwPx(550).bt.bb.bGray300.$;
  const internalProps: TextFieldInternalProps = { compound: true };

  return (
    <div css={Css.df.$}>
      <div
        css={{
          ...commonStyles,
          ...Css.bl.borderRadius("4px 0 0 4px").if(focusedEl === "left").bLightBlue700.$,
        }}
      >
        {{
          ...children[0],
          props: {
            ...children[0].props,
            onFocus: () => {
              maybeCall(children[0].props.onFocus);
              setFocusedEl("left");
            },
            onBlur: () => {
              maybeCall(children[0].props.onBlur);
              setFocusedEl(undefined);
            },
            internalProps,
          },
        }}
      </div>
      {/* Separation line */}
      <div css={Css.wPx(1).flexNone.bgGray300.if(focusedEl !== undefined).bgLightBlue700.$} />

      <div
        css={{
          ...commonStyles,
          ...Css.fg1.br.borderRadius("0 4px 4px 0").if(focusedEl === "right").bLightBlue700.$,
        }}
      >
        {{
          ...children[1],
          props: {
            ...children[1].props,
            onFocus: () => {
              maybeCall(children[1].props.onFocus);
              setFocusedEl("right");
            },
            onBlur: () => {
              maybeCall(children[1].props.onBlur);
              setFocusedEl(undefined);
            },
            internalProps,
          },
        }}
      </div>
    </div>
  );
}
