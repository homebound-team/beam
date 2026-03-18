import { FocusEvent, cloneElement, useState } from "react";
import { Css } from "src/Css";
import { TextFieldInternalProps } from "src/interfaces";

/** Internal component to help create compound fields */
export function CompoundField({ children }: { children: JSX.Element[] }) {
  if (children?.length !== 2) {
    throw new Error("CompoundField requires two children components");
  }
  const commonStyles = Css.df.aic.fs1.maxwPx(550).bt.bb.bcGray300.$;
  const internalProps: TextFieldInternalProps = { compound: true };
  // TODO(stylex): Replace focus event tracking with stylex.when.ancestor once we migrate to stylex.
  const [hasFocusWithin, setHasFocusWithin] = useState(false);

  function onFocusCapture() {
    setHasFocusWithin(true);
  }

  function onBlurCapture(e: FocusEvent<HTMLDivElement>) {
    const nextFocusedElement = e.relatedTarget;
    if (nextFocusedElement instanceof Node && e.currentTarget.contains(nextFocusedElement)) {
      return;
    }
    setHasFocusWithin(false);
  }

  return (
    <div css={Css.df.$} onFocusCapture={onFocusCapture} onBlurCapture={onBlurCapture}>
      <div
        css={{
          ...commonStyles,
          ...Css.bl.borderRadius("4px 0 0 4px").$,
          "&:focus-within": Css.bcBlue700.$,
        }}
      >
        {cloneElement(children[0], {
          internalProps,
        })}
      </div>
      {/* Separation line */}
      <div css={{ ...Css.wPx(1).fn.bgGray300.$, ...(hasFocusWithin && Css.bgBlue700.$) }} />

      <div
        css={{
          ...commonStyles,
          ...Css.fg1.br.borderRadius("0 4px 4px 0").$,
          "&:focus-within": Css.bcBlue700.$,
        }}
      >
        {cloneElement(children[1], {
          internalProps,
        })}
      </div>
    </div>
  );
}
