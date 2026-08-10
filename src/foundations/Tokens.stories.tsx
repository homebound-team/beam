import { Meta } from "@storybook/react-vite";
import { useMemo } from "react";
import { GridTableLayout, useGridTableLayoutState } from "src/components/Layout/GridTableLayout/GridTableLayout";
import { emptyCell, type GridDataRow } from "src/components/Table";
import { column } from "src/components/Table/utils/columns";
import { simpleHeader } from "src/components/Table/utils/simpleHelpers";
import { Tooltip } from "src/components/Tooltip";
import { Css, Tokens } from "src/Css";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout";
import { withBeamDecorator, withRouter } from "src/utils/sb";
import colorTokens from "../../tokens/color.json";

export default {
  title: "Foundations/Colors",
  decorators: [withBeamDecorator, withRouter()],
  parameters: { layout: "fullscreen" },
} as Meta;

export function SemanticTokens() {
  const layoutState = useGridTableLayoutState({ search: "client" });
  const columns = useMemo(() => createTokenColumns(), []);
  const rows = useMemo(() => [simpleHeader, ...buildGroupedTokenRows()], []);

  return (
    <PageHeaderLayout
      pageHeader={{
        title: "Semantic color tokens",
      }}
    >
      <GridTableLayout
        layoutState={layoutState}
        hideEditColumns
        emptyFallback="No tokens match"
        tableProps={{
          columns,
          rows,
          style: { grouped: true },
        }}
      />
    </PageHeaderLayout>
  );
}

type DtcgSrgbColor = {
  colorSpace: "srgb";
  components: [number, number, number];
  alpha?: number;
  hex?: string;
};

type ColorSource = {
  /** Primitive name (e.g. Gray900) or literal hex/rgba. */
  label: string;
  /** Hex/rgba detail when label is a primitive name. */
  detail?: string;
};

type TokenRowData = {
  name: string;
  cssVar: string;
  description: string;
  light: ColorSource;
  contrast: ColorSource | undefined;
};

type GroupLabel = {
  label: string;
  description: string;
};

type HeaderRow = { kind: "header"; id: string };
type GroupRow = { kind: "group"; id: string; data: GroupLabel; children: GridDataRow<DataRow>[] };
type DataRow = { kind: "data"; id: string; data: TokenRowData };
type Row = HeaderRow | GroupRow | DataRow;

type TokenGroupName =
  | "Surfaces & ink"
  | "Brand & selection"
  | "Danger"
  | "Text"
  | "Fields"
  | "Navigation"
  | "Neutrals"
  | "Buttons"
  | "Focus & loaders"
  | "Environment"
  | "Other";

type SemanticLeaf = {
  $type: string;
  $value: string | DtcgSrgbColor;
  $description?: string;
  $extensions?: {
    "com.homebound.beam"?: {
      cssVar?: string;
      contrast?: string | DtcgSrgbColor;
    };
  };
};

type PrimitiveLeaf = {
  $type: string;
  $value: DtcgSrgbColor;
};

function createTokenColumns() {
  const colorColumn = column<Row>({
    id: "color",
    name: "Color",
    header: "Color",
    group: (row) => ({
      content: row.label,
      value: "",
      colspan: 2,
    }),
    data: (row) => ({
      content: <ColorSwatch cssVar={row.cssVar} name={row.name} />,
      // Empty so client search only matches the token name column.
      value: "",
    }),
    w: "64px",
    clientSideSort: false,
  });

  const tokenColumn = column<Row>({
    id: "token",
    name: "Token",
    header: "Token",
    group: emptyCell,
    data: (row) => ({
      content: <TokenCell row={row} />,
      // Client search matches this value only (token name).
      value: row.name,
    }),
    mw: "240px",
    w: "2fr",
    clientSideSort: false,
  });

  const descriptionColumn = column<Row>({
    id: "description",
    name: "Description",
    header: "Description",
    group: (row) => ({
      content: row.description,
      value: "",
    }),
    data: (row) => ({
      content: row.description,
      value: "",
    }),
    mw: "220px",
    w: "2fr",
    clientSideSort: false,
  });

  return [colorColumn, tokenColumn, descriptionColumn];
}

function ColorSwatch({ cssVar, name }: { cssVar: string; name: string }) {
  const tokenValue = Tokens[name as keyof typeof Tokens];
  return (
    <div
      css={
        Css.hPx(32)
          .wPx(32)
          .br4.ba.bc(Tokens.FieldBorderDefault)
          .bgColor(tokenValue ?? `var(${cssVar})`).$
      }
      title={cssVar}
    />
  );
}

function TokenCell({ row }: { row: TokenRowData }) {
  return (
    <div css={Css.sm.$}>
      <div css={Css.smSb.$}>Tokens.{row.name}</div>
      <div css={Css.xs.color(Tokens.OnSurfaceMuted).$}>{row.cssVar}</div>
      <div css={Css.xs.mtPx(2).color(Tokens.OnSurfaceMuted).$}>
        (
        <ColorSourceLabel prefix="Light" source={row.light} />
        {" | "}
        <ColorSourceLabel prefix="Dark" source={row.contrast} />)
      </div>
    </div>
  );
}

function ColorSourceLabel({ prefix, source }: { prefix: string; source: ColorSource | undefined }) {
  if (!source) {
    return <span>{prefix}: —</span>;
  }
  const literal = sourceLiteral(source);
  return (
    <Tooltip
      placement="top"
      bgColor={Tokens.SurfaceRaised}
      title={
        <div css={Css.df.fdc.aic.gap1.color(Tokens.OnSurface).p1.$}>
          <div css={Css.hPx(40).wPx(40).br4.ba.bc(Tokens.FieldBorderDefault).bgColor(literal).$} />
          <div css={Css.xs.tal.$}>{literal}</div>
        </div>
      }
    >
      <span css={Css.cursor("default").$}>
        {prefix}: {sourceName(source)}
      </span>
    </Tooltip>
  );
}

/** Primitive name when available; otherwise the literal hex/rgba. */
function sourceName(source: ColorSource | undefined): string {
  if (!source) return "—";
  return source.label;
}

/** Resolved hex/rgba for swatches and tooltips. */
function sourceLiteral(source: ColorSource | undefined): string {
  if (!source) return "—";
  return source.detail ?? source.label;
}

function buildGroupedTokenRows(): GroupRow[] {
  const byGroup = new Map<TokenGroupName, TokenRowData[]>();
  for (const data of buildTokenRows()) {
    const group = groupForToken(data.name);
    const list = byGroup.get(group) ?? [];
    list.push(data);
    byGroup.set(group, list);
  }

  return groupOrder().flatMap((group) => {
    const tokens = byGroup.get(group);
    if (!tokens?.length) return [];
    return [
      {
        kind: "group" as const,
        id: `group-${group}`,
        data: { label: group, description: groupDescription(group) },
        children: tokens.map((data) => ({
          kind: "data" as const,
          id: data.name,
          data,
        })),
      },
    ];
  });
}

function buildTokenRows(): TokenRowData[] {
  const colorRoot = colorTokens as unknown as {
    primitive: Record<string, PrimitiveLeaf>;
    semantic: Record<string, SemanticLeaf>;
  };
  const primitives = colorRoot.primitive;

  return Object.entries(colorRoot.semantic)
    .map(([name, leaf]) => {
      const cssVar = leaf.$extensions?.["com.homebound.beam"]?.cssVar ?? Tokens[name as keyof typeof Tokens];
      const light = formatColorSource(leaf.$value, primitives);
      const contrastRaw = leaf.$extensions?.["com.homebound.beam"]?.contrast;
      const contrast = contrastRaw !== undefined ? formatColorSource(contrastRaw, primitives) : undefined;
      return {
        name,
        cssVar: cssVar ?? `--b-${name}`,
        description: leaf.$description ?? "",
        light,
        contrast,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function groupOrder(): TokenGroupName[] {
  return [
    "Surfaces & ink",
    "Brand & selection",
    "Danger",
    "Text",
    "Fields",
    "Navigation",
    "Neutrals",
    "Buttons",
    "Focus & loaders",
    "Environment",
    "Other",
  ];
}

function groupDescription(group: TokenGroupName): string {
  switch (group) {
    case "Surfaces & ink":
      return "Fills (Surface*) and foreground “ink” on them. Ink uses the On* prefix — e.g. OnSurface on Surface, OnPrimary on Primary.";
    case "Brand & selection":
      return "Primary brand fills/states, OnPrimary ink, selection checkmarks (SelectionIndicator), and muted selection fills (SelectionFill).";
    case "Danger":
      return "Destructive accents and pressed danger ink.";
    case "Text":
      return "Copy roles: labels, helpers, links, placeholders, disabled text.";
    case "Fields":
      return "Input backgrounds, borders, disabled field text, and ChoiceSelected / ChoiceDisabled fills (checkbox, radio, switch).";
    case "Navigation":
      return "Side nav (Nav*) is contrast-themed; global nav (NavGlobal*) is fixed dark chrome for the Navbar.";
    case "Neutrals":
      return "Shared gray hover/press fills for ghost and outlined controls.";
    case "Buttons":
      return "Button foregrounds (secondary, tertiary, ghost) and disabled fills/inks.";
    case "Focus & loaders":
      return "Focus rings and loading chrome.";
    case "Environment":
      return "Environment banner brand fills.";
    case "Other":
      return "Uncategorized tokens.";
  }
}

/** Keeps related roles together (mirrors tokens/README surface → control areas). */
function groupForToken(name: string): TokenGroupName {
  if (name.startsWith("Surface") || name.startsWith("OnSurface") || name === "Scrim") return "Surfaces & ink";
  if (name.startsWith("Primary") || name === "OnPrimary" || name.startsWith("Selection")) return "Brand & selection";
  if (name.startsWith("Danger")) return "Danger";
  if (name.startsWith("Text")) return "Text";
  if (name.startsWith("Field") || name.startsWith("Choice")) return "Fields";
  if (name.startsWith("Nav")) return "Navigation";
  if (name.startsWith("Neutral")) return "Neutrals";
  if (name.startsWith("Button")) return "Buttons";
  if (name.startsWith("Focus") || name.startsWith("Loader")) return "Focus & loaders";
  if (name.startsWith("Env")) return "Environment";
  return "Other";
}

function formatColorSource(value: string | DtcgSrgbColor, primitives: Record<string, PrimitiveLeaf>): ColorSource {
  if (typeof value === "string") {
    const primitiveName = primitiveNameFromRef(value);
    if (primitiveName) {
      const prim = primitives[primitiveName];
      return {
        label: primitiveName,
        detail: prim ? formatLiteralColor(prim.$value) : undefined,
      };
    }
    return { label: value };
  }
  return { label: formatLiteralColor(value) };
}

function primitiveNameFromRef(ref: string): string | undefined {
  const prefix = "{beam.color.primitive.";
  if (ref.startsWith(prefix) && ref.endsWith("}")) {
    return ref.slice(prefix.length, -1);
  }
  return undefined;
}

function formatLiteralColor(value: DtcgSrgbColor): string {
  const [r, g, b] = value.components;
  const alpha = value.alpha ?? 1;
  if (alpha < 1) {
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
  }
  if (value.hex) return value.hex;
  const toHex = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
