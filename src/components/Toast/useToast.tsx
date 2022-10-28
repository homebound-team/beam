import { useCallback } from "react";
import { useToastContext } from "./ToastContext";
import { ToastNoticeProps } from "./ToastNotice";

export interface UseToastHook {
  showToast: (props: ToastNoticeProps) => void;
}
export function useToast(): UseToastHook {
  const { setNotice } = useToastContext();

  const showToast = useCallback((props) => {
    setNotice({
      ...props,
    });
  }, []);

  return { showToast };
}
