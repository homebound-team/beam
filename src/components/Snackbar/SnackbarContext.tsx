import React, { createContext, useContext, useMemo, useState } from "react";
import { SnackbarNoticeProps } from "src/components/Snackbar/SnackbarNotice";
import { ChildrenOnly } from "src/types";
import { Offset, Snackbar } from "./Snackbar";

export type SnackbarContextProps = {
  setNotices: React.Dispatch<React.SetStateAction<SnackbarNoticeProps[]>>;
  setOffset: React.Dispatch<React.SetStateAction<Offset>>;
};

export const SnackbarContext = createContext<SnackbarContextProps>({ setNotices: () => {}, setOffset: () => {} });

export function SnackbarProvider(props: ChildrenOnly) {
  const [notices, setNotices] = useState<SnackbarNoticeProps[]>([]);
  const [offset, setOffset] = useState<Offset>({});
  const contextValue = useMemo(() => ({ setNotices, setOffset }), []);
  return (
    <SnackbarContext.Provider value={contextValue}>
      {props.children}
      <Snackbar notices={notices} offset={offset} />
    </SnackbarContext.Provider>
  );
}

export function useSnackbarContext() {
  return useContext(SnackbarContext);
}
