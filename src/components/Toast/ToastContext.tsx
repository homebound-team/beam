import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import { Toast } from "./Toast";
import { ToastNoticeProps } from "./ToastNotice";

export type ToastContextProps = {
  setNotice: React.Dispatch<React.SetStateAction<ToastNoticeProps>>;
};

export const ToastContext = createContext<ToastContextProps>({
  setNotice: () => {},
});

export function ToastProvider(props: PropsWithChildren<{}>) {
  const [notice, setNotice] = useState<ToastNoticeProps>({} as ToastNoticeProps);
  const contextValue = useMemo(() => ({ setNotice }), []);
  return (
    <ToastContext.Provider value={contextValue}>
      {props.children}
      <Toast notice={notice} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  return useContext(ToastContext);
}
