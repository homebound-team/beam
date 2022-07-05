import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import { Snackbar } from "src/components/Snackbar/Snackbar";
import { SnackbarNoticeProps } from "src/components/Snackbar/SnackbarNotice";

export type SnackbarContextProps = { setNotices: React.Dispatch<React.SetStateAction<SnackbarNoticeProps[]>> };

export const SnackbarContext = createContext<SnackbarContextProps>({ setNotices: () => {} });

export function SnackbarProvider(
  props: PropsWithChildren<{
    bottomOffset?: number;
  }>,
) {
  const [notices, setNotices] = useState<SnackbarNoticeProps[]>([]);
  const contextValue = useMemo(() => ({ setNotices }), []);
  return (
    <SnackbarContext.Provider value={contextValue}>
      {props.children}
      <Snackbar notices={notices} bottomOffset={props.bottomOffset} />
    </SnackbarContext.Provider>
  );
}

export function useSnackbarContext() {
  return useContext(SnackbarContext);
}
