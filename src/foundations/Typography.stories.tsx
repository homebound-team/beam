import { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";

export default {
  title: "Foundations/Typography",
} as Meta;

export const Typography = () => {
  const rowBaseCss = Css.vat.$;
  const firstColumnCss = Css.pr4.$;

  return (
    <div>
      <h1 css={Css.xl2.mb3.$}>Typography</h1>
      <table>
        <tr css={{ ...rowBaseCss, ...Css.xs2.$ }}>
          <td css={firstColumnCss}>2XS</td>
          <td>
            <p>Regular</p>
            <p css={Css.xs2Sb.$}>Semibold</p>
          </td>
        </tr>

        <tr css={{ ...rowBaseCss, ...Css.xs.$ }}>
          <td css={firstColumnCss}>XS</td>
          <td>
            <p>Regular</p>
            <p css={Css.xsSb.$}>Semibold</p>
          </td>
        </tr>

        <tr css={{ ...rowBaseCss, ...Css.sm.$ }}>
          <td css={firstColumnCss}>SM</td>
          <td>
            <p>Regular</p>
            <p css={Css.smSb.$}>Semibold</p>
          </td>
        </tr>

        <tr css={{ ...rowBaseCss, ...Css.md.$ }}>
          <td css={firstColumnCss}>MD</td>
          <td>
            <p>Regular</p>
            <p css={Css.mdSb.$}>Semibold</p>
          </td>
        </tr>

        <tr css={{ ...rowBaseCss, ...Css.lg.$ }}>
          <td css={firstColumnCss}>LG</td>
          <td>
            <p>Regular</p>
          </td>
        </tr>

        <tr css={{ ...rowBaseCss, ...Css.xl.$ }}>
          <td css={firstColumnCss}>XL</td>
          <td>
            <p>Regular</p>
          </td>
        </tr>

        <tr css={{ ...rowBaseCss, ...Css.xl2.$ }}>
          <td css={firstColumnCss}>2XL</td>
          <td>
            <p>Regular</p>
          </td>
        </tr>
      </table>
    </div>
  );
};
