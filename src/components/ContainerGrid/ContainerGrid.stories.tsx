import { Meta } from "@storybook/react";
import { ContainerGrid, ContainerGridProps } from "src/components/ContainerGrid/ContainerGrid";
import { Button } from "src/components";
import { useCallback, useRef, useState } from "react";
import { ContainerGridItem, ContainerGridItemProps } from "src/components/ContainerGrid/ContainerGridItem";
import { useResizeObserver } from "@react-aria/utils";
import { useContainerBreakpoint } from "src/components/ContainerGrid/useContainerBreakpoint";
import { ContainerBreakpoint } from "src/components/ContainerGrid/utils";
import { Css } from "src/Css";
import { NumberField } from "src/inputs";

export default {
  component: ContainerGrid,
} as Meta<ContainerGridProps>;

export function Example() {
  const [num, setNum] = useState(0);
  return (
    <div css={Css.maxwPx(2000).mx("auto").$}>
      <div css={Css.df.ais.$}>
        <div css={Css.add("resize", "horizontal").mwPx(120).hPx(150).bshBasic.ba.bGray400.p1.overflowAuto.mr2.$}>
          Resize Me
        </div>
        <div css={Css.mx1.fg1.$}>
          <ContainerGrid xss={Css.aifs.$}>
            <ContainerGridItem xss={Css.jcsb.df.gap2.my3.flexWrap("wrap").$}>
              <h1 css={Css.xl3Md.$}>Title of the Page</h1>
              <Button label={`Clicked: ${num} times`} onClick={() => setNum((prevState) => (prevState += 1))} />
            </ContainerGridItem>

            <ContainerGridItem sm={{ columns: 12, xss: Css.add("order", 1).$ }} lg={3} xss={Css.df.fdc.gap2.$}>
              <RailItem left />
              <RailItem left />
            </ContainerGridItem>

            <ContainerGridItem xss={Css.br8.bgWhite.bshBasic.p2.sm.$} lg={6}>
              <MainContent />
            </ContainerGridItem>

            <ContainerGridItem sm={{ columns: 12, xss: Css.add("order", 2).$ }} lg={3} xss={Css.df.fdc.gap2.$}>
              <RailItem />
              <RailItem />
            </ContainerGridItem>
          </ContainerGrid>
        </div>
      </div>
    </div>
  );
}

function MainContent() {
  const paragraph = (
    <p css={Css.my1.base.$}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Laoreet suspendisse interdum consectetur libero id faucibus nisl tincidunt eget. Amet est placerat
      in egestas erat imperdiet sed. Ultrices neque ornare aenean euismod elementum. Faucibus in ornare quam viverra
      orci sagittis. Aliquet bibendum enim facilisis gravida neque. Porttitor rhoncus dolor purus non enim. Dolor morbi
      non arcu risus quis varius. Pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Cursus risus
      at ultrices mi tempus imperdiet nulla. A lacus vestibulum sed arcu non odio. Et ultrices neque ornare aenean
      euismod elementum nisi quis eleifend. Malesuada bibendum arcu vitae elementum curabitur vitae nunc sed velit.
      Tortor consequat id porta nibh venenatis cras. At volutpat diam ut venenatis tellus in metus vulputate eu. Erat
      nam at lectus urna. Et magnis dis parturient montes nascetur. Quis hendrerit dolor magna eget est lorem ipsum.
      Libero enim sed faucibus turpis in eu mi.
    </p>
  );
  return (
    <>
      <h1 css={Css.xl2Md.$}>Main Content</h1>
      {paragraph}
      {paragraph}
      {paragraph}
    </>
  );
}

function RailItem({ left }: { left?: boolean }) {
  return (
    <div css={Css.br8.bgWhite.bshBasic.p2.smMd.$}>
      <h2 css={Css.lgSb.$}>{left ? "Left" : "Right"} Rail Item</h2>
      <ul css={Css.mx0.px3.mb1.$}>
        <li>List Item</li>
        <li>List Item</li>
        <li>List Item</li>
        <li>List Item</li>
        <li>List Item</li>
        <li>List Item</li>
      </ul>
    </div>
  );
}

export function Playground() {
  const [sm, setSm] = useState<number | undefined>(600);
  const [md, setMd] = useState<number | undefined>(1024);
  const [lg, setLg] = useState<number | undefined>(1440);
  const [columns, setColumns] = useState<number | undefined>(12);
  const [gap, setGap] = useState<number | undefined>(16);

  return (
    <div css={Css.df.fdc.gap2.$}>
      <div css={Css.df.gap1.bshBasic.p2.$}>
        <NumberField labelStyle="inline" label="sm Upper Limit" value={sm} onChange={setSm} />
        <NumberField labelStyle="inline" label="md Upper Limit" value={md} onChange={setMd} />
        <NumberField labelStyle="inline" label="lg Upper Limit" value={lg} onChange={setLg} />
        <NumberField labelStyle="inline" label="Number Columns" value={columns} onChange={setColumns} />
        <NumberField labelStyle="inline" label="Grid Gap" value={gap} onChange={setGap} />
      </div>

      <div css={Css.df.ais.$}>
        <div css={Css.add("resize", "horizontal").mwPx(120).hPx(150).bshBasic.ba.bGray400.p1.overflowAuto.mr2.$}>
          Resize Me
        </div>
        <div css={Css.fg1.$}>
          <GridHeader />
          <ContainerGrid sm={sm} md={md} lg={lg} columns={columns} gap={gap}>
            <GridItemCard sm={12} md={8} lg={6} xl={4} />
            <GridItemCard sm={12} md={4} lg={6} xl={2} />
            <GridItemCard sm={12} md={4} lg={6} xl={2} />
            <GridItemCard sm={12} md={8} lg={6} xl={4} />
          </ContainerGrid>
        </div>
      </div>
    </div>
  );
}

function GridItemCard(props: Omit<ContainerGridItemProps, "children">) {
  const [sm, setSm] = useState<number | undefined>(props.sm);
  const [md, setMd] = useState<number | undefined>(props.md);
  const [lg, setLg] = useState<number | undefined>(props.lg);
  const [xl, setXl] = useState<number | undefined>(props.xl);
  const matchedBreakpoint = useContainerBreakpoint();
  const fields: { bp: ContainerBreakpoint; value: number | undefined; onChange: (v: number | undefined) => void }[] = [
    { bp: "sm", value: sm, onChange: setSm },
    { bp: "md", value: md, onChange: setMd },
    { bp: "lg", value: lg, onChange: setLg },
    { bp: "xl", value: xl, onChange: setXl },
  ];
  return (
    <ContainerGridItem sm={sm} md={md} lg={lg} xl={xl} xss={Css.br8.bgWhite.bshBasic.df.jcc.p1.smMd.$}>
      <div css={Css.df.wPx(200).fdc.aic.jcc.gap1.$}>
        <h2 css={Css.smBd.$}>Breakpoint Definition</h2>
        {fields.map(({ bp, value, onChange }) => {
          return (
            <div key={bp} css={Css.if(matchedBreakpoint === bp).bGreen600.ba.bw2.br4.bshBasic.$}>
              <NumberField
                labelStyle="inline"
                compact
                label={`${bp.toUpperCase()}`}
                value={value}
                onChange={onChange}
                sizeToContent
              />
            </div>
          );
        })}
      </div>
    </ContainerGridItem>
  );
}

function GridHeader() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState("auto");

  const onResize = useCallback(() => {
    if (ref.current) {
      const width = ref.current.offsetWidth;
      setWidth(`${width}px`);
    }
  }, [setWidth]);
  useResizeObserver({ ref, onResize });

  return (
    <div ref={ref} css={Css.mb1.$}>
      <strong>Container Width:</strong> {width}
    </div>
  );
}
