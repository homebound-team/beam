import { ContainerGridProps } from "src/components/ContainerGrid/ContainerGrid";

export type ContainerBreakpoint = "sm" | "md" | "lg" | "xl";

export type ContainerGridDefs = Required<Omit<ContainerGridProps, "xss" | "children">>;
export const defaultGridProps: ContainerGridDefs = {
  columns: 12,
  gap: 16,
  lg: 1440,
  md: 1024,
  sm: 600,
};
