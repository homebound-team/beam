import { ReactNode, useMemo } from "react";
import { Container, Css, Properties } from "src";
import { useContainerGridContext } from "src/components/ContainerGrid/ContainerGridContext";
import { ContainerBreakpoint } from "src/components/ContainerGrid/utils";

export type ContainerGridItemProps = {
  sm?: ContainerBreakpointDef;
  md?: ContainerBreakpointDef;
  lg?: ContainerBreakpointDef;
  xl?: ContainerBreakpointDef;
  children: ReactNode;
  xss?: Properties;
};

export function ContainerGridItem(props: ContainerGridItemProps) {
  const { sm: smBp, md: mdBp, lg: lgBp, columns } = useContainerGridContext();
  const { sm: smDefs = columns, md: mdDefs = smDefs, lg: lgDefs = mdDefs, xl: xlDefs = lgDefs, xss, children } = props;

  const gridStyles: Properties = useMemo(() => {
    const bps: [ContainerBreakpoint, { lt: number } | { gt: number } | { lt: number; gt: number }][] = [
      ["xl", { gt: lgBp }],
      ["lg", { gt: mdBp, lt: lgBp }],
      ["md", { gt: smBp, lt: mdBp }],
      ["sm", { lt: smBp }],
    ];
    const styleDefs: Record<ContainerBreakpoint, ContainerBreakpointDef> = {
      sm: smDefs,
      md: mdDefs,
      lg: lgDefs,
      xl: xlDefs,
    };
    const styles = bps.map(([bp, containerProps]) => {
      const bpDefs = styleDefs[bp];
      const colSpan = typeof bpDefs === "number" ? bpDefs : bpDefs.columns;
      const bpStyles = typeof bpDefs === "number" ? {} : bpDefs.xss;

      return Css.ifContainer(containerProps).gc(`span ${colSpan}`).addIn(Container(containerProps), bpStyles).$;
    });

    return Object.assign({}, ...styles);
  }, [smBp, mdBp, lgBp, smDefs, mdDefs, lgDefs, xlDefs]);

  const styles = useMemo(() => ({ ...gridStyles, ...xss }), [gridStyles, xss]);

  return <div css={styles}>{children}</div>;
}

export type ContainerBreakpointDef = number | { columns?: number; xss?: Properties };
