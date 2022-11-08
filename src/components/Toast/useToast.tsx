import { useCallback } from "react";
import { ToastProps } from "./Toast";
import { useToastContext } from "./ToastContext";

export interface UseToastHook {
  showToast: (props: ToastProps) => void;
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
