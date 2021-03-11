import { Meta } from '@storybook/react';
import { Css, Palette, px } from '../../';

export default {
  title: 'Foundations/Color',
} as Meta;

export const Color = () => {
  const paletteEntries = Object.entries(Palette);
  const primaryPalette = paletteEntries.slice(0, 2);
  const neutralPalette = paletteEntries.filter(([name]) => name.includes('CoolGray'));
  const extendedPalette = paletteEntries.filter(([name]) => !name.includes('Cool'));
  const chartPalette = paletteEntries.filter(([name]) => name.match(/Cool\d+/));

  return (
    <div css={{ h1: Css.xl2Em.$, h2: Css.baseEm.$ }}>
      <h1>Primary Palette</h1>
      <ListColors palette={primaryPalette} />
      <h1>Neutrals</h1>
      <h2>CoolGray</h2>
      <ListColors palette={neutralPalette} />
      <h1>Extended Palette</h1>
      <h2>Coral</h2>
      <ListColors palette={extendedPalette.filter(([name]) => name.includes('Coral'))} />
      <h2>Amber</h2>
      <ListColors palette={extendedPalette.filter(([name]) => name.includes('Amber'))} />
      <h2>Emerald</h2>
      <ListColors palette={extendedPalette.filter(([name]) => name.includes('Emerald'))} />
      <h2>Sky</h2>
      <ListColors palette={extendedPalette.filter(([name]) => name.includes('Sky'))} />
      <h2>Violet</h2>
      <ListColors palette={extendedPalette.filter(([name]) => name.includes('Violet'))} />
      <h1>Chart Palette</h1>
      <h2>Cool</h2>
      <ListColors palette={chartPalette} />
    </div>
  );
};

function ListColors({ palette }: { palette: string[][] }) {
  return (
    <ul css={{ listStyle: 'none', ...Css.df.tc.$ }}>
      {palette.map(([name, color]) => (
        <ColorSquare {...{ name, color }} key={name} />
      ))}
    </ul>
  );
}

function ColorSquare({ name, color }: any) {
  const size = 80;
  return (
    <li css={Css.xsEm.$}>
      <div
        css={
          Css.h(px(size))
            .w(px(size))
            .bgColor(color).$
        }
      />
      {name}
    </li>
  );
}
