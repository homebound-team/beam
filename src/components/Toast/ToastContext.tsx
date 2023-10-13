import React, { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { BannerProps } from "src/components";

export interface ToastNoticeProps extends Omit<BannerProps, "onClose"> {}

export type ToastContextProps = {
  notice: ToastNoticeProps | undefined;
  setNotice: React.Dispatch<React.SetStateAction<ToastNoticeProps | undefined>>;
};

export const ToastContext = createContext<ToastContextProps>({
  setNotice: () => {
    throw new Error("Missing ToastProvider");
  },
  notice: undefined,
});

export function ToastProvider(props: { children: ReactNode }) {
  const [notice, setNotice] = useState<ToastNoticeProps>();
  const contextValue = useMemo(() => ({ setNotice, notice }), [setNotice, notice]);
  return <ToastContext.Provider value={contextValue}>{props.children}</ToastContext.Provider>;
}

export function useToastContext() {
  return useContext(ToastContext);
}
