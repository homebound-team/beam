import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import { Toast, ToastProps } from "./Toast";

export type ToastContextProps = {
  setNotice: React.Dispatch<React.SetStateAction<ToastProps | undefined>>;
};

export const ToastContext = createContext<ToastContextProps>({
  setNotice: () => {
    throw new Error("Missing ToastProvider");
  },
});

export function ToastProvider(props: PropsWithChildren<{}>) {
  const [notice, setNotice] = useState<ToastProps>();
  const contextValue = useMemo(() => ({ setNotice }), []);
  return (
    <ToastContext.Provider value={contextValue}>
      {props.children}
      {notice && <Toast message={notice.message} type={notice.type} />}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  return useContext(ToastContext);
}
