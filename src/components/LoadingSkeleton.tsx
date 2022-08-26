import { Css } from "src/Css";

type Sizes = "sm" | "md" | "lg";

export type LoadingSkeletonProps = {
  rows?: number;
  columns?: number;
  size?: Sizes;
  randomizeWidths?: boolean;
};

export function LoadingSkeleton({ rows = 1, columns = 1, size = "md", randomizeWidths = false }: LoadingSkeletonProps) {
  const cellArray = [...Array(columns)];
  const rowArray = [...Array(rows)];

  const rowHeight = sizeToPixels[size];

  const rowCells = (rowNumber: number) => {
    const flexGrowForCell = randomizeWidths ? getRandomizedFlexBasisByRowIndex(rowNumber) : 1;

    return cellArray.map((_, i) => (
      <div
        key={`row-${rowNumber}-cell-${i}`}
        css={
          Css.bgGray300.br4
            .add("animation", "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite")
            .add("flexGrow", flexGrowForCell).$
        }
      />
    ));
  };

  return (
    <div aria-label="Loading">
      {rowArray.map((_, i) => (
        <div key={`row-${i}`} css={Css.df.childGap1.mb1.hPx(rowHeight).$}>
          {rowCells(i)}
        </div>
      ))}
    </div>
  );
}

/** Create the illusion of random widths by cycling through a list of widths that look nice in order */
function getRandomizedFlexBasisByRowIndex(rowIndex: number) {
  const randomizedFlexBasisValues = [0.65, 0.8, 0.75, 0.9, 0.8, 0.85, 0.8, 0.95];
  const valueIndex = rowIndex % randomizedFlexBasisValues.length;
  return randomizedFlexBasisValues[valueIndex];
}

const sizeToPixels: Record<Sizes, number> = {
  sm: 16,
  md: 24,
  lg: 32,
};
