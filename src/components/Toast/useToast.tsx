import { useCallback } from "react";
import { ToastNoticeProps, useToastContext } from "./ToastContext";

export interface UseToastHook {
  showToast: (props: ToastNoticeProps) => void;
}
export function useToast(): UseToastHook {
  const { setNotice } = useToastContext();
  const showToast = useCallback(
    (props) => {
      setNotice(props);
    },
    [setNotice],
  );

  return { showToast };
}
