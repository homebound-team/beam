import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import { AlertBanner } from "./AlertBanner";
import { AlertBannerNoticeProps } from "./AlertBannerNotice";

export type AlertBannerContextProps = {
  setNotices: React.Dispatch<React.SetStateAction<AlertBannerNoticeProps[]>>;
};

export const AlertBannerContext = createContext<AlertBannerContextProps>({
  setNotices: () => {},
});

export function AlertBannerProvider(props: PropsWithChildren<{}>) {
  const [notices, setNotices] = useState<AlertBannerNoticeProps[]>([]);
  const contextValue = useMemo(() => ({ setNotices }), []);
  return (
    <AlertBannerContext.Provider value={contextValue}>
      {props.children}
      <AlertBanner notices={notices} />
    </AlertBannerContext.Provider>
  );
}

export function useAlertBannerContext() {
  return useContext(AlertBannerContext);
}
