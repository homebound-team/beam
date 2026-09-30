import type { Meta } from "@storybook/react-vite";
import { Css, Palette, Tokens, px } from "src/Css";

export default {
  title: "Foundations",
} as Meta;

export function PrimitivePalette() {
  const paletteEntries = Object.entries(Palette);
  const groups = createPaletteGroups();
  return (
    <div>
      {groups.map((group) => (
        <section key={group.name} css={Css.mb5.$}>
          <h2 css={group.description ? Css.xl.mb1.$ : Css.xl.mb3.$}>{group.name}</h2>
          {group.description && <p css={Css.md.mb3.mwPx(424).color(Tokens.OnSurfaceMuted).$}>{group.description}</p>}
          <ListColors palette={paletteEntries.filter(([name]) => group.match(name))} />
        </section>
      ))}
    </div>
  );
}

function ListColors({ palette }: { palette: [string, string][] }) {
  return (
    <ul css={Css.df.fww.add("listStyle", "none").pl0.m0.$}>
      {palette.map(([name, color]) => (
        <ColorSquare key={name} name={name} color={color} />
      ))}
    </ul>
  );
}

function ColorSquare({ name, color }: { name: string; color: string }) {
  const size = 96;
  return (
    <li css={Css.sm.mb3.mr3.tal.$}>
      <div css={Css.h(px(size)).w(px(size)).bgColor(color).br4.$} />
      <div css={Css.smSb.mt1.$}>{name.replace(/^(Gray|Blue|Red|Yellow|Green|Purple|Orange)/, "") || name}</div>
      <div css={Css.xs.color(Tokens.OnSurfaceMuted).$}>{toHex(color)}</div>
    </li>
  );
}

type PaletteGroup = {
  name: string;
  description?: string;
  match: (name: string) => boolean;
};

function createPaletteGroups(): PaletteGroup[] {
  return [
    {
      name: "White & Black",
      match: (name) => name === "White" || name === "Black",
    },
    {
      name: "Gray",
      description: "Supporting secondary colors in backgrounds, text, line elements, modals, and similar chrome.",
      match: (name) => name.startsWith("Gray"),
    },
    {
      name: "Purple",
      description: "Indication of help or clarification.",
      match: (name) => name.startsWith("Purple"),
    },
    {
      name: "Blue",
      description: "Actionable items such as hyperlinks, buttons, and hover / focus states.",
      match: (name) => name.startsWith("Blue"),
    },
    {
      name: "Green",
      description: "Positivity — success, confirmation, savings, discounts, and progress.",
      match: (name) => name.startsWith("Green"),
    },
    {
      name: "Yellow",
      description: "Holding — warnings or notifications that require attention.",
      match: (name) => name.startsWith("Yellow"),
    },
    {
      name: "Orange",
      description:
        "Typically not used in UI, but can be used on supplementary items such as tags when extra color is needed.",
      match: (name) => name.startsWith("Orange"),
    },
    {
      name: "Red",
      description: "Negativity — alerts, errors, and removal / edit treatments.",
      match: (name) => name.startsWith("Red"),
    },
  ];
}

function toHex(rgba: string): string {
  const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgba);
  if (!match) return rgba;
  return `#${[match[1], match[2], match[3]]
    .map((channel) => Number(channel).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}
