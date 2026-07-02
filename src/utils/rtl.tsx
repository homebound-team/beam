import { withRouter as _withRouter } from "@homebound/rtl-react-router-utils";
import { RenderResult, render as rtlRender, Wrapper } from "@homebound/rtl-utils";
import { ReactElement } from "react";
import { BeamProvider } from "src";

export * from "./rtlUtils";
export { _withRouter as withRouter };

type RenderOpts = {
  at?: { url: string; route?: string };
  omitBeamContext?: boolean;
};

export function render(
  component: ReactElement,
  withoutBeamProvider: RenderOpts,
  ...otherWrappers: Wrapper[]
): Promise<RenderResult & Record<string, HTMLElement>>;
export function render(
  component: ReactElement,
  ...otherWrappers: Wrapper[]
): Promise<RenderResult & Record<string, HTMLElement>>;
export function render(
  component: ReactElement,
  wrapperOrOpts: RenderOpts | Wrapper | undefined,
  ...otherWrappers: Wrapper[]
): Promise<RenderResult & Record<string, HTMLElement>> {
  let wrappers: Wrapper[];
  if (wrapperOrOpts && "wrap" in wrapperOrOpts) {
    // withBeamRTL is innermost; wrappers passed here wrap outside BeamProvider.
    // For overlay context (feature flags, Apollo), nest providers inside BeamProvider
    // and mount BeamOverlays below them — see docs/overlays.md.
    wrappers = [withBeamRTL, wrapperOrOpts as Wrapper, ...otherWrappers];
  } else if (wrapperOrOpts) {
    const { omitBeamContext, at } = wrapperOrOpts;
    wrappers = [
      ...otherWrappers,
      ...(!omitBeamContext ? [withBeamRTL] : []),
      ...(at ? [_withRouter(at.url)] : [_withRouter()]),
    ];
  } else {
    wrappers = [withBeamRTL];
  }
  return rtlRender(component, { wrappers, wait: true });
}

/** RTL wrapper for Beam's SuperDrawer/Modal context (BeamProvider fallback overlays). */
export const withBeamRTL: Wrapper = {
  wrap: (c) => <BeamProvider>{c}</BeamProvider>,
};
