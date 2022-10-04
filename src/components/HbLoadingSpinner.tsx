import React, { ReactNode, useContext, useMemo } from "react";
import { Css } from "src/Css";
import { useTestIds } from "../utils";
import SpinnerGifBase64 from "./HbLoadingSpinner.base64";

interface HbLoadingSpinnerProps {
  /** Reverts loading text to `Loading...` if true. May override global noQuips by passing in noQuips={false}. */
  noQuips?: boolean;
  /** Contextually relevant quips, like "Where did I put that invoice?" on some invoice page. Will override global noQuips if non-empty. */
  extraQuips?: ReadonlyArray<string>;
  extraQuipsOnly?: boolean;
  /** No text at all */
  iconOnly?: boolean;
}

export function HbLoadingSpinner({ noQuips, extraQuips = [], extraQuipsOnly, iconOnly }: HbLoadingSpinnerProps) {
  const ctx = useContext(HbLoadingSpinnerContext);
  const tid = useTestIds({}, "hbSpinner");

  const quip = useMemo(() => {
    const allQuips = extraQuipsOnly && extraQuips.length !== 0 ? extraQuips : [...ctx.quips, ...extraQuips];

    // If quips are off globally but custom quips were provided, then override global
    const forceQuips = extraQuips.length !== 0 || noQuips === false;
    if ((ctx.noQuips && !forceQuips) || noQuips || allQuips.length === 0) return "Loading...";

    return allQuips[Math.floor(Math.random() * allQuips.length)];
  }, [ctx.noQuips, ctx.quips, extraQuips, extraQuipsOnly, noQuips]);

  return (
    <div css={Css.df.fdc.jcc.aic.$} {...tid}>
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
        {...tid.gif}
      />
      {!iconOnly && (
        <div
          data-chromatic="ignore" // ignore spapshotting on randomized loading quips -- Mostly for consumers so their snapshots aren't constantly triggering
          {...tid.quip}
        >
          {quip}
        </div>
      )}
    </div>
  );
}

const dotDotDot = (str: string) => str.concat("...");

/** Quips for Homebound's Mission Statement. Internal. */
export const HB_QUIPS_MISSION: ReadonlyArray<string> = [
  "Loading",
  "One Team",
  "On a Mission",
  "Executing Relentlessly",
  "Building Better",
  "In Service of Our Customers",
].map(dotDotDot);

/** Fun quips internal employees should recognize. Internal. */
export const HB_QUIPS_FLAVOR: ReadonlyArray<string> = ["HOM is HOW", "Scaling Massively", "#LoveIt"].map(dotDotDot);

interface HbLoadingSpinnerContextType {
  quips: string[];
  noQuips: boolean;
}

const HbLoadingSpinnerContext = React.createContext<HbLoadingSpinnerContextType>({
  quips: ["Loading..."],
  noQuips: false,
});

interface HbSpinnerProviderProps {
  /**
   * Quips the loading spinner will use for your app. Suggest importing and using HB_QUIPS_MISSION and
   * HB_QUIPS_EXTRA for internal apps. Can also add fun app-specific quips like "Loading the blue into
   * BluePrint" or "Overriding the Underwriting"
   */
  quips?: string[];
  children: ReactNode;
}

export function HbSpinnerProvider({ quips = [], children }: HbSpinnerProviderProps) {
  const state = useMemo<HbLoadingSpinnerContextType>(() => ({ quips, noQuips: quips.length === 0 }), [quips]);
  return <HbLoadingSpinnerContext.Provider value={state}>{children}</HbLoadingSpinnerContext.Provider>;
}
