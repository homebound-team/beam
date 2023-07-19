import { useResizeObserver } from "@react-aria/utils";
import { Meta } from "@storybook/react";
import { useCallback, useRef, useState } from "react";
import {
  Button,
  ButtonGroup,
  Css,
  DnDGrid,
  DnDGridItemHandle,
  NumberField,
  PresentationProvider,
  ResponsiveGrid,
  ResponsiveGridProps,
  Switch,
  TextAreaField,
  useDnDGridItem,
} from "src";
import { useResponsiveGrid } from "src/components/Grid/useResponsiveGrid";
import { useResponsiveGridItem } from "src/components/Grid/useResponsiveGridItem";
import { zeroTo } from "src/utils/sb";

export default {
  component: ResponsiveGrid,
} as Meta<ResponsiveGridProps>;

export function Example() {
  const [minColumnWidth, setMinColumnWidth] = useState(260);
  const [columns, setColumns] = useState(4);
  const [gap, setGap] = useState(12);
  const [numItems, setNumItems] = useState(10);
  const [sortable, setSortable] = useState(false);

  const gridItems: GridItem[] = zeroTo(numItems).map((i) => ({ id: `${i + 1}` }));
  const { gridStyles } = useResponsiveGrid({ minColumnWidth, columns, gap });

  const gridItemElements = gridItems.map((item) => <ResizableGridItem key={item.id} item={item} sortable={sortable} />);

  const styles = { ...gridStyles, ...Css.fg1.add("gridAutoRows", "minmax(50px, auto)").$ };

  return (
    <PresentationProvider fieldProps={{ labelStyle: "inline", compact: true }}>
      <div css={Css.df.gap3.aic.jcfs.pb2.mb2.bb.bGray400.$}>
        <NumberField label="Columns" value={columns} onChange={(v) => v && setColumns(v)} />
        <NumberField label="Min Column Width" value={minColumnWidth} onChange={(v) => v && setMinColumnWidth(v)} />
        <NumberField label="Gap" value={gap} onChange={(v) => v && setGap(v)} />
        <NumberField label="Num Items" value={numItems} onChange={(v) => v && setNumItems(v)} />
        <Switch label="Sortable" onChange={setSortable} selected={sortable} />
        <Button
          variant="secondary"
          icon="duplicate"
          onClick={() => navigator.clipboard.writeText(createGridCodeBlock(minColumnWidth, columns, gap, sortable))}
          label="Copy Grid Code"
          tooltip="Copy code snippet for generating the Responsive Grid container"
        />
      </div>
      <div css={Css.df.$}>
        <div css={Css.add("resize", "horizontal").mwPx(120).hPx(150).bshBasic.ba.bGray400.p1.overflowAuto.mr2.$}>
          Resize Me
        </div>
        {sortable ? (
          <DnDGrid onReorder={(items) => console.log("onReorder:", { items })} gridStyles={styles}>
            {gridItemElements}
          </DnDGrid>
        ) : (
          <div css={styles}>{gridItemElements}</div>
        )}
      </div>
    </PresentationProvider>
  );
}

function ResizableGridItem({ item, sortable }: { item: GridItem; sortable: boolean }) {
  // const [colSpan, setColSpan] = useState(item.id === "2" ? 6 : item.id === "1" || item.id === "3" ? 3 : 1);
  const [colSpan, setColSpan] = useState(1);
  const [rowSpan, setRowSpan] = useState(1);
  const [stretch, setStretch] = useState(true);
  const [pin, setPin] = useState(false);
  const [text, setText] = useState("");
  const { gridItemProps } = useResponsiveGridItem({ colSpan });
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState("auto");
  const { dragItemProps, dragHandleProps } = useDnDGridItem({ id: item.id, itemRef: ref });
  const onResize = useCallback(() => {
    if (ref.current) {
      setWidth(`${ref.current.offsetWidth}px`);
    }
  }, [setWidth]);
  useResizeObserver({ ref, onResize });

  return (
    <div
      ref={ref}
      css={{
        ...Css.br8.ba.bshBasic.bGray400.bgWhite.p2.df.aic.fdc.sm.gr(`span ${rowSpan}`).if(!stretch).asfs.$,
        ...(pin ? Css.sticky.top0.$ : {}),
      }}
      {...gridItemProps}
      {...dragItemProps}
    >
      <div css={Css.df.aic.jcsb.w100.gap2.$}>
        <div css={Css.df.aic.gap1.$}>
          <div css={Css.br100.wPx(12).hPx(12).df.aic.jcc.bgGray200.gray900.p1.tinyMd.$}>{item.id}</div>
          <ButtonGroup
            size="xs"
            buttons={[
              {
                icon: "collapse",
                iconInc: 2,
                tooltip: "Toggle stretch",
                onClick: () => setStretch((s) => !s),
                active: !stretch,
              },
              {
                icon: "arrowFromTop",
                iconInc: 2,
                tooltip:
                  "Pin to top on scroll. Only works when stretch is off and when there are no elements beneath it",
                onClick: () => setPin((s) => !s),
                active: pin,
              },
              {
                icon: "duplicate",
                iconInc: 2,
                tooltip: "Copy code snippet for this grid item",
                onClick: () =>
                  navigator.clipboard.writeText(createGridItemCodeBlock(colSpan, rowSpan, sortable, pin, stretch)),
              },
            ]}
          />
        </div>

        <div css={Css.df.aic.gap1.$}>
          <div css={Css.tinyMd.gray700.$}>{width}</div>
          {sortable && <DnDGridItemHandle dragHandleProps={dragHandleProps} />}
        </div>
      </div>
      <div css={Css.df.aic.jcc.gap1.mx4.my1.$}>
        <div css={Css.fb("36px").fs0.$}>
          <NumberField
            compact
            sizeToContent
            label="Col Span"
            labelStyle="hidden"
            value={colSpan}
            onChange={(v) => v && setColSpan(v)}
          />
        </div>
        <span>x</span>
        <div css={Css.fb("36px").fs0.$}>
          <NumberField
            compact
            label="Row Span"
            labelStyle="hidden"
            value={rowSpan}
            onChange={(v) => v && setRowSpan(v)}
          />
        </div>
      </div>
      <TextAreaField
        label="Add text"
        placeholder="Add text to effect element's height"
        value={text}
        onChange={(v) => setText(v ?? "")}
      />
    </div>
  );
}

type GridItem = { id: string };

function createGridCodeBlock(minColumnWidth: number, columns: number, gap: number, sortable: boolean) {
  const gridEl = sortable ? "DnDGrid" : "div";
  return `const minColumnWidth = ${minColumnWidth};
const columns = ${columns};
const gap = ${gap};
const { gridStyles } = useResponsiveGrid({ minColumnWidth, columns, gap });
    
return <${gridEl} css={{ ...gridStyles }}></${gridEl}>;
`;
}

function createGridItemCodeBlock(
  colSpan: number,
  rowSpan: number,
  sortable: boolean,
  pin?: boolean,
  stretch?: boolean,
) {
  return `const { gridItemProps } = useResponsiveGridItem({ colSpan: ${colSpan} });
${
  sortable
    ? `
const itemRef = useRef<HTMLDivElement>(null);
const { dragItemProps, dragHandleProps } = useDnDGridItem({ id: item.id, itemRef });`
    : ""
}

return (
<div
  css={Css.br8.ba.bshBasic.bGray400.bgWhite.p1.sm.${sortable ? "relative." : ""}${
    rowSpan !== 1 ? `gr("span ${rowSpan}").` : ""
  }${pin ? `sticky.top0.` : ""}${!stretch ? "asfs." : ""}$}
  {...gridItemProps} ${
    sortable
      ? `
  ref={itemRef}
  {...dragItemProps}`
      : ""
  }
>${
    sortable
      ? `
  <div css={Css.absolute.top1.right1.$}>
          <DnDGridItemHandle dragHandleProps={dragHandleProps} />
        </div>
        `
      : ""
  }</div>
);`;
}
