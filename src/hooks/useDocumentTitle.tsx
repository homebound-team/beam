import { useLayoutEffect } from "react";
import { useDocumentTitleConfig } from "src/components/DocumentTitle/DocumentTitleContext";
import { formatDocumentTitle, joinDocumentTitleSegments } from "src/components/DocumentTitle/formatDocumentTitle";

/** Sets `document.title` from joined segments plus provider env prefix and app suffix. */
export function useDocumentTitle(...titleSegments: (string | undefined)[]): void {
  const config = useDocumentTitleConfig();
  const pageTitle = joinDocumentTitleSegments(...titleSegments);

  useLayoutEffect(() => {
    if (!config || !pageTitle || typeof document === "undefined") {
      return;
    }

    document.title = formatDocumentTitle({ ...config, pageTitle });

    return () => {
      // Reset on unmount. Expect next page to set its own title, but in case it doesn't we don't persist the previous title.
      document.title = formatDocumentTitle(config);
    };
  }, [config, pageTitle]);
}
