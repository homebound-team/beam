import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { BaseCard } from "src/components/BaseCard";
import { Carousel } from "src/components/Carousel";
import { Tag } from "src/components/Tag";
import { Css, Tokens } from "src/Css";
import { newStory, samples, withRouter } from "src/utils/sb";
import type { PlayFunction } from "storybook/internal/types";
import { userEvent } from "storybook/test";

export default {
  component: BaseCard,
  decorators: [withRouter()],
} as Meta;

/**
 * The shell's variations side by side:a status tag, a hero action (button or menu), the card
 * acting as a link or a button — including the hover/focus states each takes on — and an
 * interactive footer. Each is a one-prop difference from `BaseCard`'s defaults, so they share a
 * story rather than each claiming a full-page one.
 */
export const Default = newStory(
  () => (
    <CardContainer>
      {samples(
        [
          "Static",
          <BaseCard key="static" imgSrc={imgSrc()}>
            <CardTitle />
          </BaseCard>,
        ],
        [
          "As link",
          <BaseCard key="link" imgSrc={imgSrc()} to="/plan/1" imgAlt="The Emerson Houston">
            <CardTitle />
          </BaseCard>,
        ],
        [
          "As button (focused)",
          <BaseCard key="focus" imgSrc={imgSrc()} onClick={() => {}} imgAlt="The Emerson Houston">
            <CardTitle />
          </BaseCard>,
        ],
        [
          "With tag",
          <BaseCard key="tag" imgSrc={imgSrc()} imageFit="contain" tag={{ text: "Active", type: "success" }}>
            <div css={Css.p3.df.fdc.gap1.$}>
              <div css={Css.sm.color(Tokens.OnSurface).$}>Kohler</div>
              <div css={Css.xl.color(Tokens.OnSurface).$}>Forté Showerhead</div>
            </div>
          </BaseCard>,
        ],
        [
          "With button menu",
          <BaseCard
            key="menu"
            imgSrc={imgSrc()}
            action={{
              trigger: { icon: "verticalDots" },
              items: [
                { label: "Edit", onClick: () => {} },
                { label: "Duplicate", onClick: () => {} },
              ],
            }}
          >
            <CardTitle />
          </BaseCard>,
        ],
        [
          "With footer (tags, wrapping)",
          <BaseCard key="footerTags" imgSrc={imgSrc()} to="/plan/1" imgAlt="Forté Showerhead" footer={<TagsFooter />}>
            <CardTitle text="Forté Showerhead" />
          </BaseCard>,
        ],
        [
          "With footer (carousel)",
          <BaseCard
            key="footerCarousel"
            imgSrc={imgSrc()}
            to="/plan/1"
            imgAlt="Forté Showerhead"
            footer={<CarouselFooter />}
          >
            <CardTitle text="Forté Showerhead" />
          </BaseCard>,
        ],
      )}
    </CardContainer>
  ),
  { play: defaultPlayFn() },
);

/**
 * The Change Event configuration card. The body lives here rather than in `BaseCard` because the
 * label|value table is specific to this type — copy it as-is when building the real card.
 */
export function Configuration() {
  return (
    <CardContainer>
      <BaseCard
        imgSrc={imgSrc()}
        action={{ icon: "trash", variant: "outline", onClick: () => {}, label: "Remove configuration" }}
      >
        <ConfigurationBody eyebrow="12345" title="Configuration C" rows={createConfigurationRows()} />
      </BaseCard>
    </CardContainer>
  );
}

/** Side-by-side, the way the Guided Change Event workflow compares the two. */
export function ConfigurationComparison() {
  return (
    <div css={Css.df.gap3.$}>
      <CardContainer>
        <div css={Css.smSb.color(Tokens.OnSurface).mb1.$}>Original</div>
        <BaseCard imgSrc={imgSrc()}>
          <ConfigurationBody eyebrow="12345" title="Configuration D" rows={createConfigurationRows({ plain: true })} />
        </BaseCard>
      </CardContainer>
      <CardContainer>
        <div css={Css.smSb.color(Tokens.OnSurface).mb1.$}>Replacement</div>
        <BaseCard
          imgSrc={imgSrc()}
          action={{ icon: "trash", variant: "outline", onClick: () => {}, label: "Remove configuration" }}
        >
          <ConfigurationBody eyebrow="12345" title="Configuration C" rows={createConfigurationRows()} />
        </BaseCard>
      </CardContainer>
    </div>
  );
}

/** `height` pins every card to the same box, so a grid of them lines up despite uneven bodies. */
export function FixedHeight() {
  return (
    <div css={Css.df.gap3.$}>
      <CardContainer>
        <BaseCard imgSrc={imgSrc()} height={380}>
          <CardTitle text="Short body" />
        </BaseCard>
      </CardContainer>
      <CardContainer>
        <BaseCard imgSrc={imgSrc()} height={380}>
          <ConfigurationBody eyebrow="12345" title="Taller body" rows={createConfigurationRows({ plain: true })} />
        </BaseCard>
      </CardContainer>
    </div>
  );
}

export function AiMode() {
  return (
    <CardContainer>
      <BaseCard imgSrc={imgSrc()} aiMode>
        <ConfigurationBody eyebrow="12345" title="Configuration C" rows={createConfigurationRows()} />
      </BaseCard>
    </CardContainer>
  );
}

/**
 * Rings the "As button" sample for focus. There's no equivalent for hover: `userEvent.hover` only
 * dispatches synthetic pointer events, which never update a real browser's `:hover` hit-testing —
 * so it can't be used to demonstrate `bshHover` in a static screenshot.
 */
function defaultPlayFn(): PlayFunction {
  return async () => {
    // Two tabs land on the "As button" sample's button: one for the "As link" sample's anchor right
    // before it (the only other focusable thing above it), one for this button. Both sit right after
    // "Static", which has nothing focusable, so this count doesn't drift if later samples change.
    await userEvent.tab();
    await userEvent.tab();
  };
}

type ConfigurationRow = { label: string; value: string; tag?: { text: string; type: "success" | "warning" } };

/**
 * The Configuration body: a label|value table, each row optionally flagged with an icon-only `Tag`.
 * Figma sets both columns to 14px on a 26px line, with the labels semibold.
 */
function ConfigurationBody(props: { eyebrow: string; title: string; rows: ConfigurationRow[] }) {
  const { eyebrow, title, rows } = props;
  return (
    <div css={Css.p3.df.fdc.gap2.$}>
      <div>
        <div css={Css.sm.color(Tokens.OnSurface).$}>{eyebrow}</div>
        <div css={Css.xl.color(Tokens.OnSurface).$}>{title}</div>
      </div>
      <dl css={Css.df.gapPx(12).m0.color(Tokens.OnSurface).$}>
        <div css={Css.df.fdc.wPx(135).fs0.$}>
          {rows.map((r) => (
            <dt key={r.label} css={Css.smSb.lh("26px").$}>
              {r.label}
            </dt>
          ))}
        </div>
        <div css={Css.df.fdc.fg1.mw0.$}>
          {rows.map((r) => (
            <dd key={r.label} css={Css.sm.lh("26px").m0.df.aic.jcsb.gap1.$}>
              <span css={Css.truncate.$}>{r.value}</span>
              {r.tag && <Tag iconOnly icon={r.tag.type === "success" ? "check" : "error"} {...r.tag} />}
            </dd>
          ))}
        </div>
      </dl>
    </div>
  );
}

/** `plain` drops the per-row flags, i.e. the "Original" side that nothing is being compared against. */
function createConfigurationRows(opts: { plain?: boolean } = {}): ConfigurationRow[] {
  const { plain = false } = opts;
  const rows: ConfigurationRow[] = [
    { label: "Plan", value: "The Iris", tag: { text: "Unchanged", type: "success" } },
    { label: "Elevation", value: "Transitional", tag: { text: "Changed", type: "warning" } },
    { label: "Ext. Scheme", value: "Alabaster", tag: { text: "Changed", type: "warning" } },
    { label: "Int. Scheme", value: "Craftsman", tag: { text: "Unchanged", type: "success" } },
    { label: "Spec Level", value: "Essential", tag: { text: "Changed", type: "warning" } },
    { label: "Version", value: "V6", tag: { text: "Changed", type: "warning" } },
    { label: "Updated", value: "2/1/26", tag: { text: "Changed", type: "warning" } },
  ];
  return plain ? rows.map(({ label, value }) => ({ label, value })) : rows;
}

/** Enough tags to wrap onto a second line, so the sample shows how a long list grows the card. */
function TagsFooter() {
  return (
    <div css={Css.px3.pb3.pt2.df.fww.gap1.$}>
      {materialSwatchLabels().map((label) => (
        <Tag key={label} text={label} type="neutral" />
      ))}
    </div>
  );
}

/** `Carousel` in a footer — the shape a row of material/variant swatches commonly takes. */
function CarouselFooter() {
  return (
    <div css={Css.px3.pb3.pt2.$}>
      <Carousel>
        {materialSwatches().map((s) => (
          <img key={s.label} src={s.src} alt={s.label} css={Css.hPx(32).wPx(32).br8.ba.bcGray300.oh.objectCover.$} />
        ))}
      </Carousel>
    </div>
  );
}

function materialSwatchLabels(): string[] {
  return materialSwatches().map((s) => s.label);
}

function materialSwatches(): { label: string; src: string }[] {
  return [
    { label: "Chrome", src: "plan-exterior.png" },
    { label: "Matte Black", src: "disposal.png" },
    { label: "Bronze", src: "plan-exterior.png" },
    { label: "Nickel", src: "disposal.png" },
    { label: "Gold", src: "plan-exterior.png" },
    { label: "Copper", src: "disposal.png" },
    { label: "White", src: "plan-exterior.png" },
    { label: "Chrome 2", src: "plan-exterior.png" },
    { label: "Matte Black 2", src: "disposal.png" },
    { label: "Bronze 2", src: "plan-exterior.png" },
  ];
}

function CardTitle(props: { text?: string }) {
  const { text = "The Emerson Houston" } = props;
  return (
    <div css={Css.p3.$}>
      <div css={Css.xl.color(Tokens.OnSurface).$}>{text}</div>
    </div>
  );
}

function CardContainer({ children }: { children: ReactNode }) {
  return <div css={Css.wPx(330).$}>{children}</div>;
}

function imgSrc() {
  return "plan-exterior.png";
}
