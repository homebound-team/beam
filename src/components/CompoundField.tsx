import { cloneElement, useState, type FocusEvent, type JSX } from "react";
import { Css, Tokens } from "src/Css";
import type { TextFieldInternalProps } from "src/interfaces";

export type CompoundFieldProps = {
  /** Exactly two field components to join into one bordered control. */
  children: JSX.Element[];
};

/** Joins two fields into one bordered control that shares focus styling. */
export function CompoundField(props: CompoundFieldProps) {
  const { children } = props;
  // TODO(stylex): Replace focus event tracking with stylex.when.ancestor once we migrate to stylex.
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  if (children?.length !== 2) {
    throw new Error("CompoundField requires two children components");
  }
  const commonStyles = Css.df.aic.fs1.maxwPx(550).bt.bb.bc(Tokens.FieldBorderDefault).$;
  const internalProps: TextFieldInternalProps = { compound: true };

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
          ...Css.bl.borderRadius("8px 0 0 8px").$,
          ...(hasFocusWithin && Css.bc(Tokens.FieldBorderFocus).$),
        }}
      >
        {cloneElement(children[0], {
          internalProps,
        })}
      </div>
      {/* Separation line */}
      <div
        css={{
          ...Css.wPx(1).fn.bgColor(Tokens.FieldBorderDefault).$,
          ...(hasFocusWithin && Css.bgColor(Tokens.FieldBorderFocus).$),
        }}
      />

      <div
        css={{
          ...commonStyles,
          ...Css.fg1.br.borderRadius("0 8px 8px 0").$,
          ...(hasFocusWithin && Css.bc(Tokens.FieldBorderFocus).$),
        }}
      >
        {cloneElement(children[1], {
          internalProps,
        })}
      </div>
    </div>
  );
}
