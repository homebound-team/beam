import { Meta } from "@storybook/react-vite";
import { Carousel } from "src/components/Carousel";
import { Chip } from "src/components/Chip";
import { Css, Tokens } from "src/Css";
import { withRouter } from "src/utils/sb";

export default {
  component: Carousel,
  decorators: [withRouter()],
} as Meta;

export function Default() {
  return (
    <Container>
      <Carousel>
        {swatches.map((color) => (
          <Swatch key={color} color={color} />
        ))}
      </Carousel>
    </Container>
  );
}

export function WithoutOverflow() {
  return (
    <Container>
      <Carousel>
        {swatches.slice(0, 3).map((color) => (
          <Swatch key={color} color={color} />
        ))}
      </Carousel>
    </Container>
  );
}

/** The strip takes any children */
export function WithLargerItems() {
  return (
    <Container width={800}>
      <Carousel gap={16}>
        {swatches.map((color) => (
          <div key={color} css={Css.hPx(96).wPx(140).br8.df.aic.jcc.sm.$} style={{ backgroundColor: color }}>
            {color}
          </div>
        ))}
      </Carousel>
    </Container>
  );
}

/** Small items work too */
export function WithChips() {
  return (
    <Container>
      <Carousel gap={4}>
        {["Kohler", "Moen", "Delta", "Grohe", "Hansgrohe", "Brizo", "Pfister", "American Standard"].map((brand) => (
          <Chip key={brand} text={brand} />
        ))}
      </Carousel>
    </Container>
  );
}

/** `chevronInc` sizes the icon, and its button and the strip's fade follow from it. */
export function LargerChevrons() {
  return (
    <div css={Css.df.fdc.gap3.$}>
      {[3, 4, 5].map((inc) => (
        <div key={inc}>
          <h2 css={Css.sm.mb1.$}>chevronInc={inc}</h2>
          <Container>
            <Carousel chevronInc={inc}>
              {swatches.map((color) => (
                <Swatch key={color} color={color} />
              ))}
            </Carousel>
          </Container>
        </div>
      ))}
    </div>
  );
}

/**
 * The edge fade masks the items themselves rather than painting a matching color over them, so it
 * works on any background without being told what that background is.
 */
export function OnOtherBackgrounds() {
  return (
    <div css={Css.df.fdc.gap3.$}>
      {[Tokens.SurfaceRaised, Tokens.SurfaceSubtle, Tokens.SurfaceRaisedHover].map((token) => (
        <div key={token} css={Css.wPx(330).p2.br12.bgColor(token).ba.bc(Tokens.FieldBorderDefault).$}>
          <Carousel>
            {swatches.map((color) => (
              <Swatch key={color} color={color} />
            ))}
          </Carousel>
        </div>
      ))}
    </div>
  );
}

function Container({ children, width = 330 }: { children: JSX.Element; width?: number }) {
  return (
    <div css={{ ...Css.p2.br12.bgColor(Tokens.SurfaceRaised).ba.bc(Tokens.FieldBorderDefault).$, ...Css.wPx(width).$ }}>
      {children}
    </div>
  );
}

function Swatch({ color }: { color: string }) {
  return <div css={Css.hPx(32).wPx(32).br8.ba.bcGray300.$} style={{ backgroundColor: color }} />;
}

const swatches = [
  "#c0c0c0",
  "#8c7853",
  "#b87333",
  "#d4af37",
  "#e5e4e2",
  "#ffffff",
  "#2f2f2f",
  "#1c1c1c",
  "#a8a9ad",
  "#6e7f80",
];
