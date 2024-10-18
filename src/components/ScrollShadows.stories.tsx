import { Css } from "src";
import { GridColumn, GridTable, simpleHeader, SimpleHeaderAndData } from "src/components";
import { ScrollShadows } from "src/components/ScrollShadows";
import { zeroTo } from "src/utils/sb";

export default {
  component: ScrollShadows,
};

export function Examples() {
  return (
    <>
      <h2 css={Css.mb1.lgSb.$}>Vertical scroll</h2>
      <ScrollShadows xss={Css.hPx(200).wPx(400).bgWhite.p1.ba.bcGray200.$}>
        {"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget ultricies aliquam, nunc ".repeat(
          20,
        )}
      </ScrollShadows>

      <div css={Css.mt3.bgWhite.br8.wPx(400).oh.$}>
        <ScrollShadows xss={Css.hPx(200).bgWhite.p1.ba.bcGray200.$}>
          <GridTable
            columns={columns}
            rows={[simpleHeader, ...rowData.map((r) => ({ kind: "data" as const, id: r.id, data: r }))]}
          />
        </ScrollShadows>
      </div>

      <div css={Css.mt3.df.fdc.bgWhite.ba.bcGray200.bshBasic.br8.oh.hPx(200).wPx(400).$}>
        <div css={Css.pPx(20).pb2.bgWhite.fw6.$}>Fixed Header</div>
        <ScrollShadows xss={Css.pxPx(20).fg1.$}>
          {"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget ultricies aliquam, nunc ".repeat(
            20,
          )}
        </ScrollShadows>
      </div>

      <h2 css={Css.mt8.mb1.lgSb.$}>Horizontal scroll</h2>
      <ScrollShadows xss={Css.wPx(200).bgWhite.p1.ba.bcGray200.wsnw.$} horizontal>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget ultricies aliquam, nunc
      </ScrollShadows>

      <div css={Css.mt3.df.gap1.aic.bgWhite.ba.bcGray200.br4.p1.oh.wPx(400).$}>
        <div css={Css.df.aic.fs0.fw6.$}>Fixed Label:</div>
        <ScrollShadows xss={Css.wsnw.fg1.$} horizontal>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget ultricies aliquam, nunc
        </ScrollShadows>
      </div>
    </>
  );
}

type Row = SimpleHeaderAndData<RowData>;
type RowData = { id: string; address: string; homeowner: string; market: string };

const rowData: RowData[] = zeroTo(10).map((i) => ({
  id: `r:${i + 1}`,
  address: "1234 Address Lane",
  market: "SO Cal",
  homeowner: "John Doe",
}));
const columns: GridColumn<Row>[] = [
  { header: "ID", data: (data) => data.id },
  { header: "Homeowner", data: (data) => data.homeowner },
  { header: "Address", data: (data) => data.address },
  { header: "Market", data: (data) => data.market },
];
