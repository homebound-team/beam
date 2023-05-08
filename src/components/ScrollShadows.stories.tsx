import { Css } from "src";
import { ScrollShadows } from "src/components/ScrollShadows";

export default {
  component: ScrollShadows,
  title: "Components/ScrollShadows",
};

export function Vertical() {
  return (
    <>
      <h2 css={Css.mb1.lgSb.$}>Vertical scroll</h2>
      <ScrollShadows xss={Css.hPx(200).wPx(400).bgWhite.p1.ba.bGray200.$}>
        {"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget ultricies aliquam, nunc ".repeat(
          20,
        )}
      </ScrollShadows>

      <div css={Css.mt3.df.fdc.bgWhite.ba.bGray200.bshBasic.br8.overflowHidden.hPx(200).wPx(400).$}>
        <div css={Css.pPx(20).pb2.bgWhite.fw6.$}>Fixed Header</div>
        <ScrollShadows xss={Css.pxPx(20).fg1.$}>
          {"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget ultricies aliquam, nunc ".repeat(
            20,
          )}
        </ScrollShadows>
      </div>

      <h2 css={Css.mt8.mb1.lgSb.$}>Horizontal scroll</h2>
      <ScrollShadows xss={Css.wPx(200).bgWhite.p1.ba.bGray200.nowrap.$} horizontal>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget ultricies aliquam, nunc
      </ScrollShadows>

      <div css={Css.mt3.df.gap1.aic.bgWhite.ba.bGray200.br4.p1.overflowHidden.wPx(400).$}>
        <div css={Css.df.aic.fs0.fw6.$}>Fixed Label:</div>
        <ScrollShadows xss={Css.nowrap.fg1.$} horizontal>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget ultricies aliquam, nunc
        </ScrollShadows>
      </div>
    </>
  );
}
