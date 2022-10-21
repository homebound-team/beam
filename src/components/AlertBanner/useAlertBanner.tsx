import { useCallback } from "react";
import { useAlertBannerContext } from "./AlertBannerContext";
import { AlertBannerNoticeProps } from "./AlertBannerNotice";

export interface UseAlertBannerHook {
  showAlert: (props: AlertBannerNoticeProps) => void;
}
export function useAlertBanner(): UseAlertBannerHook {
  const { setNotices } = useAlertBannerContext();
  const showAlert = useCallback((props) => {
    setNotices((prev) => prev.concat({ ...props }));
  }, []);
  return { showAlert };
}
