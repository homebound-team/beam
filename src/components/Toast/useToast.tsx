import { useCallback } from "react";
import { ToastNoticeProps, useToastContext } from "./ToastContext";

export interface UseToastProps {
  showToast: (props: ToastNoticeProps) => void;
}
export function useToast(): UseToastProps {
  const { setNotice } = useToastContext();
  const showToast = useCallback(
    (props) => {
      setNotice(props);
    },
    [setNotice],
  );

  return { showToast };
}
