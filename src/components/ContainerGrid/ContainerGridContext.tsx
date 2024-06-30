import { createContext, MutableRefObject, PropsWithChildren, useContext, useMemo } from "react";
import { defaultGridProps } from "src/components/ContainerGrid/utils";

type ContainerGridContextProps = {
  columns: number;
  gap: number;
  lg: number;
  md: number;
  sm: number;
  containerRef?: MutableRefObject<HTMLDivElement | null>;
};

export const ContainerGridContext = createContext<ContainerGridContextProps>({
  ...defaultGridProps,
});

export function ContainerGridProvider(props: PropsWithChildren<ContainerGridContextProps>) {
  const { columns, gap, lg, md, sm, containerRef, children } = props;
  const value = useMemo(() => ({ columns, gap, lg, md, sm, containerRef }), [columns, gap, lg, md, sm, containerRef]);
  return <ContainerGridContext.Provider value={value}>{children}</ContainerGridContext.Provider>;
}

export function useContainerGridContext() {
  return useContext(ContainerGridContext);
}
