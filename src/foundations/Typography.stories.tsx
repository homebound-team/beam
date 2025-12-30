import { Meta } from "@storybook/react";
import { Css } from "src/Css";

export default {
  title: "Foundations/Typography",
} as Meta;

export const Typography = () => {
  return (
    <div>
      <h1 css={Css.xl2.mb3.$}>Typography</h1>
      <table
        css={{
          "& > tr": Css.add("verticalAlign", "top").$,
          "& > tr > td:nth-of-type(1)": Css.pr4.$,
        }}
      >
        <tr css={Css.xs2.$}>
          <td>2XS</td>
          <td>
            <p>Regular</p>
            <p css={Css.xs2Sb.$}>Semibold</p>
          </td>
        </tr>

        <tr css={Css.xs.$}>
          <td>XS</td>
          <td>
            <p>Regular</p>
            <p css={Css.xsSb.$}>Semibold</p>
          </td>
        </tr>

        <tr css={Css.sm.$}>
          <td>SM</td>
          <td>
            <p>Regular</p>
            <p css={Css.smSb.$}>Semibold</p>
          </td>
        </tr>

        <tr css={Css.md.$}>
          <td>MD</td>
          <td>
            <p>Regular</p>
            <p css={Css.mdSb.$}>Semibold</p>
          </td>
        </tr>

        <tr css={Css.lg.$}>
          <td>LG</td>
          <td>
            <p>Regular</p>
          </td>
        </tr>

        <tr css={Css.xl.$}>
          <td>XL</td>
          <td>
            <p>Regular</p>
          </td>
        </tr>

        <tr css={Css.xl2.$}>
          <td>2XL</td>
          <td>
            <p>Regular</p>
          </td>
        </tr>
      </table>
    </div>
  );
};
