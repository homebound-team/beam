import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { capitalCase } from "change-case";
import { Button, ButtonSize, ButtonVariant } from "src";
import { Css } from "src/Css";
import { withRouter } from "src/utils/sb";

export default {
  title: "Components/Button",
  component: Button,
  decorators: [withRouter()],
  parameters: {
    // To better view the hover state
    backgrounds: { default: "white" },
  },
} as Meta;

const sizes: ButtonSize[] = ["sm", "md", "lg"];
const variants: ButtonVariant[] = ["primary", "secondary", "tertiary", "tertiaryDanger", "danger"];

export function ButtonVariations({ contrast = false }: { contrast?: boolean }) {
  return (
    <div css={Css.if(contrast).white.$}>
      <div css={Css.dg.gtc("repeat(4, max-content)").jifs.gap("8px 16px").$}>
        {variants.map((variant, idx) => {
          const variantName = capitalCase(variant);
          return (
            <div key={variantName} css={Css.display("contents").$}>
              <h2 css={Css.xl.gc("1/5").if(idx !== 0).mt3.$}>{variantName}</h2>
              {sizes.map((size) => (
                <div key={size} css={Css.display("contents").$}>
                  <Button
                    size={size}
                    variant={variant}
                    label={`${variantName} button`}
                    contrast={contrast}
                    onClick={action("Clicked")}
                  />
                  <Button
                    size={size}
                    variant={variant}
                    disabled
                    label="Disabled"
                    contrast={contrast}
                    onClick={action("Clicked")}
                  />
                  <Button
                    size={size}
                    variant={variant}
                    icon="plus"
                    label={`${variantName} button`}
                    contrast={contrast}
                    onClick={action("Clicked")}
                  />
                  <Button
                    size={size}
                    variant={variant}
                    disabled
                    icon="plus"
                    label="Disabled"
                    contrast={contrast}
                    onClick={action("Clicked")}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div css={Css.mt3.$}>
        <h2 css={Css.xl.$}>Text</h2>
        <div css={Css.my1.dg.gtc("repeat(2, max-content)").jifs.gap("8px 16px").$}>
          <Button variant="text" label="Text Button" contrast={contrast} onClick={action("Clicked")} />
          <Button variant="text" disabled label="Disabled" contrast={contrast} onClick={action("Clicked")} />
          <Button icon="plus" variant="text" label="Text Button" contrast={contrast} onClick={action("Clicked")} />
          <Button
            icon="plus"
            variant="text"
            disabled
            label="Disabled"
            contrast={contrast}
            onClick={action("Clicked")}
          />
        </div>
        <p css={Css.mb1.xs.$}>
          Example of a <Button variant="text" label="Text Button" contrast={contrast} onClick={action("Clicked")} />{" "}
          placed inheriting "xs" font size.
        </p>
        <p css={Css.lg.$}>
          Example of a <Button variant="text" label="Text Button" contrast={contrast} onClick={action("Clicked")} />{" "}
          placed inheriting "lg" font size.
        </p>
      </div>
    </div>
  );
}

export function ContrastVariations() {
  return <ButtonVariations contrast={true} />;
}
ContrastVariations.parameters = { backgrounds: { default: "dark" } };

export function ButtonLink() {
  return (
    <div>
      <div css={Css.dg.gtc("repeat(5, max-content)").jifs.gap("8px 16px").$}>
        {variants.map((variant, idx) => {
          const variantName = variant.charAt(0).toUpperCase() + variant.slice(1);
          return (
            <div key={variantName} css={Css.display("contents").$}>
              <h2 css={Css.xl.gc("1/6").if(idx !== 0).mt3.$}>{variantName}</h2>
              <Button variant={variant} onClick="/fakePath" label="Relative URL link" />
              <Button variant={variant} onClick="/" label="Relative URL - Open in New Tab" openInNew />
              <Button variant={variant} onClick="https://www.homebound.com" label="Absolute URL link" />
              <Button variant={variant} onClick="tony-stark.jpg" label="Download link" download />
              <Button variant={variant} icon="plus" onClick="/fakePath" label="Disabled link" disabled />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ButtonWithTooltip() {
  return (
    <div css={Css.dg.fdc.childGap2.jcfs.$}>
      <div>
        <h2>Tooltip provided via 'disabled' property</h2>
        <Button
          disabled={
            <div>
              You <b>cannot</b> currently perform this operation because of:
              <ul>
                <li>reason one</li>
                <li>reason two</li>
              </ul>
            </div>
          }
          label="Upload"
          onClick={action("Clicked")}
        />
      </div>
      <div>
        <h2>Tooltip provided via 'tooltip' property</h2>
        <Button tooltip="Create a new entity" label="Add new" onClick={action("Clicked")} />
      </div>
    </div>
  );
}

export function AsyncButton() {
  return (
    <div>
      <h2>Clicking the button will disable it for 2 seconds (while async request is in progress)</h2>
      <Button label="Upload" onClick={async () => await new Promise((resolve) => setTimeout(resolve, 2000))} />
    </div>
  );
}
