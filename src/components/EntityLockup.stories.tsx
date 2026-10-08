import type { Meta } from "@storybook/react-vite";
import { EntityLockup } from "src/components/EntityLockup";
import { Icon } from "src/components/Icon";
import { IconButton } from "src/components/IconButton";
import { Tag } from "src/components/Tag";
import { Css, Palette } from "src/Css";
import { LabeledExamples } from "src/utils/sb";
import { action } from "storybook/actions";

export default {
  title: "Components/Entity Lockup",
  component: EntityLockup,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/givQaQnS8wqXaD89AnBkcR/Guided-Change-Event-Workflow?node-id=2324-7685",
    },
  },
} as Meta;

export function Examples() {
  return (
    <LabeledExamples
      direction="column"
      examples={[
        {
          label: "Default",
          children: (
            <EntityLockup imgSrc="disposal.png" title="Garbage Disposal" description="1/2 HP, stainless steel" />
          ),
        },
        {
          label: "Long description",
          children: (
            <div css={Css.w100.maxwPx(480).$}>
              <EntityLockup imgSrc="fridge.jpeg" title="Olympus Appliance Pull" description={longDescription()} />
            </div>
          ),
        },
        {
          label: "Title only",
          children: <EntityLockup imgSrc="counter-top.jpeg" title="Quartz Countertop" />,
        },
        {
          label: "With tag and price",
          children: (
            <div css={Css.w100.maxwPx(720).$}>
              <EntityLockup
                imgSrc="counter-top.jpeg"
                title="Natural 7” Plank"
                description={longDescription()}
                right={
                  <>
                    <Tag type="update" text="7 days to cutoff" />
                    <span css={Css.sm.gray900.$}>+ $10.00</span>
                  </>
                }
              />
            </div>
          ),
        },
        {
          label: "Compact",
          children: <EntityLockup compact imgSrc="plan-exterior.png" title="Modern Tudor (B)" description="Exterior" />,
        },
        {
          label: "Compact sidebar row",
          children: (
            <div css={Css.w100.maxwPx(332).$}>
              <EntityLockup
                compact
                imgSrc="counter-top.jpeg"
                title="Flooring"
                description={
                  <div css={Css.df.fdc.gapPx(2).$}>
                    <span>Natural 7” Plank</span>
                    <span css={Css.df.aic.gapPx(4).$}>
                      <Icon icon="refresh" inc={2} color={Palette.Blue600} />
                      Changed
                    </span>
                  </div>
                }
                right={
                  <div css={Css.df.aic.gap1.$}>
                    <span css={Css.sm.gray900.$}>$10.00</span>
                    <IconButton icon="x" label="Remove" onClick={action("remove")} />
                  </div>
                }
              />
            </div>
          ),
        },
      ]}
    />
  );
}

function longDescription() {
  return "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";
}
