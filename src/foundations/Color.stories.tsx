import { Meta } from "@storybook/react";
import { Css, Palette, px } from "src/Css";

export default {
  title: "Foundations/Color",
} as Meta;

export const Color = () => {
  const paletteEntries = Object.entries(Palette);
  return (
    <div css={{ "& > h1": Css.xl4Sb.mb4.$, "& > h2": Css.xl2Sb.mb4.$ }}>
      <h1>Extended Palette</h1>
      <h2>Gray</h2>
      <ListColors palette={paletteEntries.filter(([name]) => name.includes("Gray"))} />
      <h2>Blue</h2>
      <ListColors palette={paletteEntries.filter(([name]) => name.includes("Blue"))} />
      <h2>Red</h2>
      <ListColors palette={paletteEntries.filter(([name]) => name.includes("Red"))} />
      <h2>Yellow</h2>
      <ListColors palette={paletteEntries.filter(([name]) => name.includes("Yellow"))} />
      <h2>Green</h2>
      <ListColors palette={paletteEntries.filter(([name]) => name.includes("Green"))} />
      <h2>Purple</h2>
      <ListColors palette={paletteEntries.filter(([name]) => name.includes("Purple"))} />
      <h2>Orange</h2>
      <ListColors palette={paletteEntries.filter(([name]) => name.includes("Orange"))} />
    </div>
  );
};

function ListColors({ palette }: { palette: string[][] }) {
  return (
    <ul css={{ listStyle: "none", ...Css.df.tac.$ }}>
      {palette.map(([name, color]) => (
        <ColorSquare key={name} {...{ name, color }} />
      ))}
    </ul>
  );
}

function ColorSquare({ name, color }: any) {
  const size = 100;
  return (
    <li css={Css.sm.mb5.tal.$}>
      <div css={Css.h(px(size)).w(px(size)).bgColor(color).$} />
      <em>{name}</em>
    </li>
  );
}
