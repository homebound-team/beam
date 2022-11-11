import React, { createContext, PropsWithChildren, ReactNode, useContext, useMemo, useState } from "react";
import { Toast, ToastTypes } from "./Toast";

export interface ToastNoticeProps {
  type: ToastTypes;
  message: ReactNode;
}

export type ToastContextProps = {
  notice: ToastNoticeProps | undefined;
  setNotice: React.Dispatch<React.SetStateAction<ToastNoticeProps | undefined>>;
};

export const ToastContext = createContext<ToastContextProps>({
  setNotice: () => {},
  notice: { type: "error", message: "" },
});

export function ToastProvider(props: PropsWithChildren<{}>) {
  const [notice, setNotice] = useState<ToastNoticeProps>();
  const contextValue = useMemo(() => ({ setNotice, notice }), [setNotice, notice]);
  return (
    <ToastContext.Provider value={contextValue}>
      {props.children}
      <Toast />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  return useContext(ToastContext);
}
