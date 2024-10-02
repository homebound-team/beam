import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { BannerProps } from "src/components";

export interface ToastNoticeProps extends Omit<BannerProps, "onClose"> {}

export type ToastContextProps = {
  notice: ToastNoticeProps | undefined;
  setNotice: React.Dispatch<React.SetStateAction<ToastNoticeProps | undefined>>;
  clear: () => void;
};

export const ToastContext = createContext<ToastContextProps>({
  setNotice: () => {
    throw new Error("Missing ToastProvider");
  },
  clear: () => {},
  notice: undefined,
});

export function ToastProvider(props: { children: ReactNode }) {
  const [notice, setNotice] = useState<ToastNoticeProps>();
  const clear = useCallback(() => setNotice(undefined), [setNotice]);
  const contextValue = useMemo(() => ({ setNotice, notice, clear }), [notice, clear]);
  return <ToastContext.Provider value={contextValue}>{props.children}</ToastContext.Provider>;
}

export function useToastContext() {
  return useContext(ToastContext);
}
