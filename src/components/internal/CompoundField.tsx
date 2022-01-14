import { cloneElement } from "react";
import { Css } from "src/Css";
import { TextFieldInternalProps } from "src/interfaces";

/** Internal component to help create compound fields */
export function CompoundField({ children }: { children: JSX.Element[] }) {
  if (children?.length !== 2) {
    throw global.Error("CompoundField requires two children components");
  }
  const commonStyles = Css.df.aic.fs1.maxwPx(550).bt.bb.bGray300.$;
  const internalProps: TextFieldInternalProps = { compound: true };

  return (
    <div
      css={{
        ...Css.df.$,
        "&:focus-within > div:nth-of-type(2)": Css.bgLightBlue700.$, // Separation line when inputs are focused
      }}
    >
      <div
        css={{
          ...commonStyles,
          ...Css.bl.borderRadius("4px 0 0 4px").$,
          "&:focus-within": Css.bLightBlue700.$,
        }}
      >
        {cloneElement(children[0], {
          internalProps,
        })}
      </div>
      {/* Separation line */}
      <div css={Css.wPx(1).flexNone.bgGray300.$} />

      <div
        css={{
          ...commonStyles,
          ...Css.fg1.br.borderRadius("0 4px 4px 0").$,
          "&:focus-within": Css.bLightBlue700.$,
        }}
      >
        {cloneElement(children[1], {
          internalProps,
        })}
      </div>
    </div>
  );
}
