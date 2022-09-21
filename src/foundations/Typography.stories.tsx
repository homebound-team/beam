import { Meta } from "@storybook/react";
import { Css } from "src/Css";

export default {
  title: "Foundations/Typography",
} as Meta;

export const Typography = () => {
  return (
    <div>
      <h1 css={Css.xl2Sb.mb3.$}>Typography</h1>
      <table
        css={{
          tr: Css.add("verticalAlign", "top").$,
          "td:nth-of-type(1)": Css.pr4.$,
        }}
      >
        <tr css={Css.tiny.$}>
          <td>Tiny</td>
          <td>
            <p>Regular</p>
            <p css={Css.tinyMd.$}>Medium</p>
            <p css={Css.tinySb.$}>Semibold</p>
            <p css={Css.tinyBd.$}>Bold</p>
          </td>
        </tr>

        <tr css={Css.xs.$}>
          <td>XS</td>
          <td>
            <p>Regular</p>
            <p css={Css.xsMd.$}>Medium</p>
            <p css={Css.xsSb.$}>Semibold</p>
            <p css={Css.xsBd.$}>Bold</p>
          </td>
        </tr>

        <tr css={Css.sm.$}>
          <td>SM</td>
          <td>
            <p>Regular</p>
            <p css={Css.smMd.$}>Medium</p>
            <p css={Css.smSb.$}>Semibold</p>
            <p css={Css.smBd.$}>Bold</p>
          </td>
        </tr>

        <tr css={Css.base.$}>
          <td>Base</td>
          <td>
            <p>Regular</p>
            <p css={Css.baseMd.$}>Medium</p>
            <p css={Css.baseSb.$}>Semibold</p>
            <p css={Css.baseBd.$}>Bold</p>
          </td>
        </tr>

        <tr css={Css.lg.$}>
          <td>LG</td>
          <td>
            <p>Regular</p>
            <p css={Css.lgMd.$}>Medium</p>
            <p css={Css.lgSb.$}>Semibold</p>
            <p css={Css.lgBd.$}>Bold</p>
          </td>
        </tr>

        <tr css={Css.xl.$}>
          <td>XL</td>
          <td>
            <p>Regular</p>
            <p css={Css.xlMd.$}>Medium</p>
            <p css={Css.xlSb.$}>Semibold</p>
            <p css={Css.xlBd.$}>Bold</p>
          </td>
        </tr>

        <tr css={Css.xl2.$}>
          <td>2XL</td>
          <td>
            <p>Regular</p>
            <p css={Css.xl2Md.$}>Medium</p>
            <p css={Css.xl2Sb.$}>Semibold</p>
            <p css={Css.xl2Bd.$}>Bold</p>
          </td>
        </tr>

        <tr css={Css.xl3.$}>
          <td>3XL</td>
          <td>
            <p>Regular</p>
            <p css={Css.xl3Md.$}>Medium</p>
            <p css={Css.xl3Sb.$}>Semibold</p>
            <p css={Css.xl3Bd.$}>Bold</p>
          </td>
        </tr>

        <tr css={Css.xl4.$}>
          <td>4XL</td>
          <td>
            <p>Regular</p>
            <p css={Css.xl4Md.$}>Medium</p>
            <p css={Css.xl4Sb.$}>Semibold</p>
            <p css={Css.xl4Bd.$}>Bold</p>
          </td>
        </tr>

        <tr css={Css.xl5.$}>
          <td>5XL</td>
          <td>
            <p>Regular</p>
            <p css={Css.xl5Md.$}>Medium</p>
            <p css={Css.xl5Sb.$}>Semibold</p>
            <p css={Css.xl5Bd.$}>Bold</p>
          </td>
        </tr>
      </table>
    </div>
  );
};
