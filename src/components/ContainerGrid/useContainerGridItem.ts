import { useMemo } from "react";
import { useContainerGridContext } from "src/components/ContainerGrid/ContainerGridContext";

export type UseContainerGridItemProps = {
  /** The number of columns to span at the `xl` breakpoint */
  xl?: number;
  /** The number of columns to span at the `lg` breakpoint */
  lg?: number;
  /** The number of columns to span at the `md` breakpoint */
  md?: number;
  /** The number of columns to span at the `sm` breakpoint */
  sm?: number;
};

/**
 * Returns data attribute props to be spread onto a grid item HTML element.
 */
export function useContainerGridItem(props: UseContainerGridItemProps) {
  const { columns = 1 } = useContainerGridContext();
  const { sm = columns, md = sm, lg = md, xl = lg } = props;
  const dataAttributes = useMemo(() => {
    return { "data-colspan-sm": sm, "data-colspan-md": md, "data-colspan-lg": lg, "data-colspan-xl": xl };
  }, [sm, md, lg, xl]);
  return dataAttributes;
}
