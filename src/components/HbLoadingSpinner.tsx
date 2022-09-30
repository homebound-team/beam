import random from "lodash/random";
import React, { ReactNode, useContext, useMemo } from "react";
import { Css } from "src/Css";
import SpinnerGifBase64 from "./HbLoadingSpinner.base64";

interface HbLoadingSpinnerProps {
  /** Reverts loading text to `Loading...` if true. If global quips are off, they can be forced on by passing in `false`. */
  noQuips?: boolean;
  /** Contextually relevant quips, like "Where did I put that invoice??" on some invoice page. */
  extraQuips?: ReadonlyArray<string>;
  extraQuipsOnly?: boolean;
  /** No text at all */
  iconOnly?: boolean;
}

export function HbLoadingSpinner({ noQuips, extraQuips = [], extraQuipsOnly, iconOnly }: HbLoadingSpinnerProps) {
  const ctx = useContext(HbLoadingSpinnerContext);

  const quip = useMemo(() => {
    // If quips are off globally but custom quips were provided, then override global
    const forceQuips = extraQuips.length !== 0;
    if ((ctx.noQuips && !forceQuips) || noQuips) {
      return "Loading...";
    }

    const allQuips = extraQuipsOnly && extraQuips.length !== 0 ? extraQuips : [...ctx.quips, ...extraQuips];
    return allQuips[random(allQuips.length - 1)];
  }, [ctx.noQuips, ctx.quips, extraQuips, extraQuipsOnly, noQuips]);

  return (
    <div data-testid="hbLoadingSpinner" css={Css.df.fdc.jcc.aic.$}>
      <img
        src={SpinnerGifBase64}
        data-chromatic="ignore" // Chromatic timing would snapshot this on different frames of the 24-frame gif, so ignore it
        css={
          Css.add({
            // Image is white-on-black, so this flips it to black-on-white for our almost-always white backgrounds
            filter: "invert(1)",
          }).$
        }
        alt="loading"
      />
      {!iconOnly && <div>{quip}</div>}
    </div>
  );
}

const GLOBAL_LOADING_QUIPS: ReadonlyArray<string> = [
  "Loading",
  "HOM is HOW",
  "One Team",
  "On a Mission",
  "Executing Relentlessly",
  "Building Better",
  "In Service of Our Customers",
  "Scaling Massively",
  "#LoveIt",
].map((quip) => quip.concat("..."));

interface HbLoadingSpinnerContextType {
  quips: string[];
  noQuips: boolean;
}

const HbLoadingSpinnerContext = React.createContext<HbLoadingSpinnerContextType>({
  quips: [...GLOBAL_LOADING_QUIPS],
  noQuips: false,
});

interface HbSpinnerProviderProps {
  /** Fun app-specific quips like "Loading the blue into BluePrint" or "Overriding the Underwriting" */
  extraAppQuips?: string[];
  /** I mean... but why though. Do you hate joy and happiness? */
  noQuips?: boolean;
  children: ReactNode;
}

export function HbSpinnerProvider({ extraAppQuips = [], noQuips = false, children }: HbSpinnerProviderProps) {
  const state = useMemo<HbLoadingSpinnerContextType>(
    () => ({ quips: [...GLOBAL_LOADING_QUIPS, ...extraAppQuips], noQuips }),
    [extraAppQuips, noQuips],
  );
  return <HbLoadingSpinnerContext.Provider value={state}>{children}</HbLoadingSpinnerContext.Provider>;
}
