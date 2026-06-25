import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import type { AppEnvironment } from "src/components/EnvironmentBanner/EnvironmentBanner";

export type DocumentTitleConfig = {
  env: AppEnvironment;
  suffix?: string;
};

const DocumentTitleContext = createContext<DocumentTitleConfig | undefined>(undefined);

export function DocumentTitleProvider(props: PropsWithChildren<DocumentTitleConfig>) {
  const { children, env, suffix } = props;
  const value = useMemo(() => ({ env, suffix }), [env, suffix]);

  return <DocumentTitleContext.Provider value={value}>{children}</DocumentTitleContext.Provider>;
}

/** Used by {@link useDocumentTitle}. */
export function useDocumentTitleConfig(): DocumentTitleConfig | undefined {
  return useContext(DocumentTitleContext);
}
