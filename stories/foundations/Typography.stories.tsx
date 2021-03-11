import { Meta } from '@storybook/react';
import { Css } from '../../';

export default {
  title: 'Foundations/Typography',
} as Meta;

export const Typography = () => (
  <div css={{ p: Css.m0.$ }}>
    <h1 css={Css.xl2Em.$}>Typography</h1>
    <br />
    <p css={Css.tiny.$}>tiny</p>
    <p css={Css.tinyEm.$}>tinyEm</p>
    <br />
    <p css={Css.xs.$}>xs</p>
    <p css={Css.xsEm.$}>xsEm</p>
    <br />
    <p css={Css.sm.$}>sm</p>
    <p css={Css.smEm.$}>smEm</p>
    <br />
    <p css={Css.base.$}>base</p>
    <p css={Css.baseEm.$}>baseEm</p>
    <br />
    <p css={Css.lg.$}>lg</p>
    <p css={Css.lgEm.$}>lgEm</p>
    <br />
    <p css={Css.xl.$}>xl</p>
    <p css={Css.xlEm.$}>xlEm</p>
    <br />
    <p css={Css.xl2.$}>xl2</p>
    <p css={Css.xl2Em.$}>xl2Em</p>
    <br />
    <p css={Css.xl3.$}>xl3</p>
    <p css={Css.xl3Em.$}>xl3Em</p>
    <br />
    <p css={Css.xl4.$}>xl4</p>
    <p css={Css.xl4Em.$}>xl4Em</p>
    <br />
    <p css={Css.xl5.$}>xl5</p>
    <p css={Css.xl5Em.$}>xl5Em</p>
  </div>
);
