import { useCallback } from "react";
import { type ToastNoticeProps, useToastContext } from "./ToastContext";

export type UseToastProps = {
  showToast: (props: ToastNoticeProps) => void;
  clear: () => void;
};

/** @deprecated Use `usePageBanner` for page status, or the Snackbar for transient confirmations. */
export function useToast(): UseToastProps {
  const { setNotice, clear } = useToastContext();
  const showToast = useCallback((props: ToastNoticeProps) => setNotice(props), [setNotice]);

  return { showToast, clear };
}
