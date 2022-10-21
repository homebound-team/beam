import { useMemo } from "react";
import { AlertBannerProps } from "./AlertBanner";
import { useBeamContext } from "./BeamContext";

export interface UseAlertBannerHook {
  showAlert: (props: AlertBannerProps) => void;
  // closeAlertBanner: () => void;
}
export function useAlertBanner(): UseAlertBannerHook {
  const { alertBannerState } = useBeamContext();
  console.log("this is working");
  return useMemo(
    () => ({
      showAlert(props) {
        alertBannerState.current = { ...props };
      },
    }),
    [alertBannerState],
  );
}
