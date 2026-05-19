import { Meta } from "@storybook/react-vite";
import { Css, Palette, px } from "src/Css";

export default {
  title: "Foundations/Color",
} as Meta;

export const Color = () => {
  const paletteEntries = Object.entries(Palette);
  return (
    <div>
      <h1 css={Css.xl2.mb4.$}>Extended Palette</h1>
      <h2 css={Css.xl.mb4.$}>Gray</h2>
      <ListColors palette={paletteEntries.filter(([name]) => name.startsWith("Gray"))} />
      <h2 css={Css.xl.mb4.$}>Blue</h2>
      <ListColors palette={paletteEntries.filter(([name]) => name.startsWith("Blue"))} />
      <h2 css={Css.xl.mb4.$}>Red</h2>
      <ListColors palette={paletteEntries.filter(([name]) => name.startsWith("Red"))} />
      <h2 css={Css.xl.mb4.$}>Yellow</h2>
      <ListColors palette={paletteEntries.filter(([name]) => name.startsWith("Yellow"))} />
      <h2 css={Css.xl.mb4.$}>Green</h2>
      <ListColors palette={paletteEntries.filter(([name]) => name.startsWith("Green"))} />
      <h2 css={Css.xl.mb4.$}>Purple</h2>
      <ListColors palette={paletteEntries.filter(([name]) => name.startsWith("Purple"))} />
      <h2 css={Css.xl.mb4.$}>Orange</h2>
      <ListColors palette={paletteEntries.filter(([name]) => name.startsWith("Orange"))} />
    </div>
  );
};

function ListColors({ palette }: { palette: string[][] }) {
  return (
    <ul css={Css.df.tac.add("listStyle", "none").$}>
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
