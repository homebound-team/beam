import React, { PropsWithChildren, useContext } from "react";

type GridTableContextProps = {
  inTable: boolean;
};

export const GridTableContext = React.createContext<GridTableContextProps>({
  inTable: false,
});

export function GridTableProvider({ children }: PropsWithChildren<{}>) {
  const context = { inTable: true };
  return <GridTableContext.Provider value={context}>{children}</GridTableContext.Provider>;
}

export function useGridTable() {
  return useContext(GridTableContext);
}
