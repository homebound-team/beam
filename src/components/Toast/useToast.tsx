import { useCallback } from "react";
import { useToastContext } from "./ToastContext";

export interface UseToastHook {
  showToast: (notice: ReactNode) => void;
}
export function useToast(): UseToastHook {
  const { notice, setNotice } = useToastContext();
  const showToast = useCallback(() => {
    setNotice(notice);
  }, [setNotice]);

  return { showToast };
}
