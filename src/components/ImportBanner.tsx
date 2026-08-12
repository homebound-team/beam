import { ReactNode } from "react";
import { AiLoader } from "src/components/AiLoader";
import { BlueprintAiLogo } from "src/components/Logos";
import { Css, Palette, Properties } from "src/Css";
import { useTestIds } from "src/utils";

export type ImportBannerSize = "sm" | "lg";

export type ImportBannerProps = {
  /** Heading above the copy, drawn with the Blueprint AI gradient. */
  title?: string;
  /** Sets expectations for how long the import runs, and what the user can do meanwhile. */
  message?: ReactNode;
  /**
   * `sm` (default) is the page-level banner; `lg` is the roomier standalone card, i.e. when the
   * import is the only thing on screen.
   */
  size?: ImportBannerSize;
};

/**
 * Tells the user an AI import is running, and that they're free to go do something else.
 *
 * Indeterminate by design — imports don't report progress, so this only ever shows `AiLoader`
 * and never a percentage or ETA.
 */
export function ImportBanner(props: ImportBannerProps) {
  const { title = "Importing Details...", message = defaultMessage, size = "sm" } = props;
  const tid = useTestIds(props, "importBanner");
  const { wrapper, card, logoHeight } = sizeStyles[size];
  return (
    // `status` rather than `alert` so assistive tech waits for a pause instead of interrupting,
    // and `aria-busy` so it knows the surrounding content is still settling.
    <div
      css={{ ...Css.df.fdc.aifs.px3.py2.bgWhite.add("backgroundImage", wash).$, ...wrapper }}
      role="status"
      aria-busy={true}
      {...tid}
    >
      <BlueprintAiLogo height={logoHeight} />
      <div css={{ ...Css.df.fdc.aic.gap1.w100.bgWhite.bshBasic.$, ...card }}>
        {/* Keeps its own `aiLoader` test id and "Loading" label, so nothing to thread through. */}
        <AiLoader />
        <span css={{ ...Css.lg.$, ...gradientText }} {...tid.title}>
          {title}
        </span>
        <span css={Css.sm.gray800.tac.$} {...tid.message}>
          {message}
        </span>
      </div>
    </div>
  );
}

const defaultMessage =
  "This process can take a few minutes. Feel free to keep working in another tab. Once imported, you may edit or add to content before saving.";

/** `Palette` values are opaque `rgba(...)` strings, so re-alpha one to layer it as a tint. */
function alpha(color: Palette, a: number): string {
  return color.replace(/,\s*1\)$/, `, ${a})`);
}

/**
 * The same purple-to-blue ramp the `aiStar` sparkle uses, so the loader and the title read as one
 * mark. Horizontal, not diagonal — the design's style is named "Diagonal", but the fill it actually
 * renders has no vertical component.
 */
const titleGradient = `linear-gradient(90deg, ${Palette.Purple700}, ${Palette.Blue700})`;

const gradientText = Css.purple700
  .add("backgroundImage", titleGradient)
  .add("backgroundClip", "text")
  .add("WebkitBackgroundClip", "text")
  // Clears the glyph *fill* so the background shows through. Deliberately not `color: transparent`,
  // which would hide the text outright on an engine that can't clip a background to it — the
  // `purple700` above is that fallback instead.
  .add("WebkitTextFillColor", "transparent").$;

/**
 * A faint violet-blue-violet wash. The design draws this as a radial gradient, but its transform
 * stretches the long axis to ~21k px, so within a banner's height it only ever varies left-to-right
 * — this is that one axis, with the stops rounded to the nearest `Palette` entry (within 2/255 of
 * the design's render) instead of carrying four one-off hexes.
 */
const wash = [
  `linear-gradient(90deg,`,
  `${alpha(Palette.Purple600, 0.07)} 0%,`,
  `${alpha(Palette.Blue300, 0.07)} 36%,`,
  `${alpha(Palette.Purple600, 0.07)} 73%)`,
].join(" ");

/** Only the chrome scales between sizes; the loader and copy are identical in both. */
const sizeStyles: Record<ImportBannerSize, { wrapper: Properties; card: Properties; logoHeight: number }> = {
  sm: { wrapper: Css.gapPx(4).$, card: Css.br12.ptPx(12).px2.pb2.$, logoHeight: 2 },
  lg: { wrapper: Css.gap1.$, card: Css.br16.pt3.px3.pb6.$, logoHeight: 3 },
};
