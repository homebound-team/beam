import { createContext, type PropsWithChildren, useContext, useMemo } from "react";
import type { AppEnvironment } from "src/components/EnvironmentBanner/EnvironmentBanner";

export type DocumentTitleConfig = {
  /** Prefixes the title with `[ENV]` outside prod. */
  env: AppEnvironment;
  /** The app name, appended after the page title (`Page | Suffix`). */
  suffix?: string;
};

const DocumentTitleContext = createContext<DocumentTitleConfig | undefined>(undefined);

/** Supplies the title format for {@link useDocumentTitle}; `BeamProvider` adds one when given `documentTitleConfig`. */
export function DocumentTitleProvider(props: PropsWithChildren<DocumentTitleConfig>) {
  const { children, env, suffix } = props;
  const value = useMemo(() => ({ env, suffix }), [env, suffix]);

  return <DocumentTitleContext.Provider value={value}>{children}</DocumentTitleContext.Provider>;
}

/** Used by {@link useDocumentTitle}. */
export function useDocumentTitleConfig(): DocumentTitleConfig | undefined {
  return useContext(DocumentTitleContext);
}
