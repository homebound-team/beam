import { useResizeObserver } from "@react-aria/utils";
import {
  createContext,
  type CSSProperties,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { BeamColor } from "src/colors";
import { Css, Tokens } from "src/Css";
import { useBodyBackgroundColor } from "src/hooks/useBodyBackgroundColor";
import { DocumentScrollToTopButton } from "src/layouts/DocumentScrollToTopButton";
import { beamLayoutViewportHeightVar, beamLayoutViewportWidthVar } from "./layoutVars";

const DocumentScrollLayoutContext = createContext(false);

export type DocumentScrollLayoutProviderProps = {
  children: ReactNode;
  /** Background color applied to `document.body` while this provider is mounted. */
  bodyBackgroundColor?: BeamColor;
};

/** Outermost document-scroll layout root; nested providers bypass. Publishes viewport CSS vars. */
export function DocumentScrollLayoutProvider({
  children,
  bodyBackgroundColor = Tokens.Surface,
}: DocumentScrollLayoutProviderProps): JSX.Element {
  const inDocumentScrollLayout = useContext(DocumentScrollLayoutContext);
  // Nested layouts already sit under an outer measurement root.
  if (inDocumentScrollLayout) return <>{children}</>;

  return (
    <DocumentScrollLayoutContext.Provider value={true}>
      <DocumentScrollLayoutViewportRoot bodyBackgroundColor={bodyBackgroundColor}>
        {children}
      </DocumentScrollLayoutViewportRoot>
    </DocumentScrollLayoutContext.Provider>
  );
}

/** True when inside a document-scroll Beam layout (e.g. for virtualized `GridTable` scroll delegation). */
export function useDocumentScrollLayout(): boolean {
  return useContext(DocumentScrollLayoutContext);
}

function DocumentScrollLayoutViewportRoot({
  children,
  bodyBackgroundColor,
}: {
  children: ReactNode;
  bodyBackgroundColor: BeamColor;
}) {
  useBodyBackgroundColor(bodyBackgroundColor);

  const docElementRef = useRef<HTMLElement | null>(typeof document !== "undefined" ? document.documentElement : null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const syncViewportSize = useCallback(() => {
    const el = docElementRef.current;
    if (!el) return;
    const width = el.clientWidth;
    const height = el.clientHeight;
    // Bail when unchanged so a ResizeObserver fire with no size delta doesn't re-render.
    setViewportSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  }, []);

  useResizeObserver({ ref: docElementRef, onResize: syncViewportSize });
  useLayoutEffect(() => {
    syncViewportSize();
  }, [syncViewportSize]);

  const style: Record<string, string> = {};
  if (viewportSize.width > 0) {
    style[beamLayoutViewportWidthVar] = `${viewportSize.width}px`;
  }
  if (viewportSize.height > 0) {
    style[beamLayoutViewportHeightVar] = `${viewportSize.height}px`;
  }

  return (
    // `display: contents` keeps vars inheritable without adding a layout box.
    <div css={Css.display("contents").$} style={Object.keys(style).length > 0 ? (style as CSSProperties) : undefined}>
      {children}
      <DocumentScrollToTopButton viewportHeight={viewportSize.height} />
    </div>
  );
}
