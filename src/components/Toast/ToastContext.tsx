import React, {
  createContext,
  Dispatch,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

export interface ToastProps {
  type: "error" | "warning" | "success" | "info" | "alert";
  message: ReactNode;
}

export type ToastContextProps = {
  notice: ToastProps | undefined;
  setNotice: Dispatch<SetStateAction<ToastProps | undefined>>;
};

export const ToastContext = createContext<ToastContextProps>({ setNotice: (n) => {}, notice: undefined! });

export function ToastProvider(props: PropsWithChildren<{}>) {
  const [notice, setNotice] = useState<ToastContextProps>();
  const contextValue = useMemo(() => ({ notice, setNotice }), [notice, setNotice]);
  return <ToastContext.Provider value={contextValue}>{props.children}</ToastContext.Provider>;
}

export function useToastContext() {
  return useContext(ToastContext);
}
