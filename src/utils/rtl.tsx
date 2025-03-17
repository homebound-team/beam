import { withRouter as _withRouter } from "@homebound/rtl-react-router-utils";
import { RenderResult, render as rtlRender, Wrapper } from "@homebound/rtl-utils";
import { ReactElement } from "react";
import { BeamProvider } from "src";

export * from "./rtlUtils";
export { _withRouter as withRouter };

interface RenderOpts {
  at?: { url: string; route?: string };
  omitBeamContext?: boolean;
}

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
    // They passed at least single wrapper + maybe more.
    // We put `withBeamRTL` first so that any `withApollo`s wrap outside of beam, so in-drawer/in-modal content has apollo
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

/** RTL wrapper for Beam's SuperDrawer/Modal context. */
export const withBeamRTL: Wrapper = {
  wrap: (c) => <BeamProvider>{c}</BeamProvider>,
};
