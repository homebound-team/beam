import { RenderResult, render as rtlRender, Wrapper } from "@homebound/rtl-utils";
import { createMemoryHistory } from "history";
import { ReactElement } from "react";
import { Router } from "react-router";
import { BeamProvider } from "src";
import { QueryParamProvider } from "src/utils/useQueryParamsCompat";
import { ReactRouter5Adapter } from "use-query-params/adapters/react-router-5";

export * from "./rtlUtils";

export function withRouter(url = "/") {
  const history = createMemoryHistory({ initialEntries: [url] });
  const wrap: Wrapper["wrap"] = (c) => (
    <Router history={history}>
      <QueryParamProvider adapter={ReactRouter5Adapter}>{c}</QueryParamProvider>
    </Router>
  );
  return { history, wrap };
}

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
      ...(at ? [withRouter(at.url)] : [withRouter()]),
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
