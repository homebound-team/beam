import { useCallback } from "react";
import { ToastNoticeProps, useToastContext } from "./ToastContext";

export interface UseToastProps {
  showToast: (props: ToastNoticeProps) => void;
  clear: () => void;
}
export function useToast(): UseToastProps {
  const { setNotice, clear } = useToastContext();
  const showToast = useCallback((props: ToastNoticeProps) => setNotice(props), [setNotice]);

  return { showToast, clear };
}
