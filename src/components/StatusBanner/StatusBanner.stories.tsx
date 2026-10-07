import type { Meta } from "@storybook/react-vite";
import type { ComponentType, ReactNode } from "react";
import {
  StatusBanner,
  type BannerItemProps,
  type BannerType,
  type PageBannerProps,
} from "src/components/StatusBanner/StatusBanner";
import { Css } from "src/Css";
import { noop } from "src/utils/helpers";
import { LabeledExamples, viewportModes, type LabeledExample } from "src/utils/sb";

export default {
  component: StatusBanner,
  parameters: {
    chromatic: { modes: viewportModes("desktop", "mobile1") },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=2923-8876",
    },
  },
} as Meta;

/** Inline banners scroll with the page: tinted fill, a 2px outline, and optional item rows. */
export function Inline() {
  return (
    <div css={Css.df.fdc.gap5.w100.$}>
      <ExampleGroup title="Types" examples={typeExamples(StatusBanner)} />
      <ExampleGroup title="Variations" examples={variationExamples(StatusBanner)} />
      <ExampleGroup title="With items" examples={withItemsExamples()} />
    </div>
  );
}

/** Fill-only chrome a layout's slot renders. Item rows stay on the inline banner. */
export function Sticky() {
  return (
    <div css={Css.df.fdc.gap5.w100.$}>
      <ExampleGroup title="Types" examples={typeExamples(StickyBanner)} />
      <ExampleGroup title="Variations" examples={variationExamples(StickyBanner)} />
    </div>
  );
}

function ExampleGroup(props: { title: string; examples: LabeledExample[] }) {
  return (
    <section css={Css.df.fdc.gap1.w100.$}>
      <h2 css={Css.mdSb.$}>{props.title}</h2>
      <LabeledExamples direction="column" examples={props.examples} />
    </section>
  );
}

function typeExamples(View: ComponentType<PageBannerProps>): LabeledExample[] {
  return bannerTypes().map((type) => ({
    label: type,
    children: <View {...sampleBanner(type)} />,
  }));
}

function variationExamples(View: ComponentType<PageBannerProps>): LabeledExample[] {
  return [
    {
      label: "Title only",
      children: <View type="info" title="Scope updates from Plan 1 - The Sycamore v117" />,
    },
    {
      label: "Primary action only",
      children: (
        <View
          type="info"
          title="Scope updates from Plan 1 - The Sycamore v117"
          description="Please review scope changes detailed below. Scope updates will never remove costs from your bid."
          primaryAction={{ label: "Mark as Reviewed", onClick: noop }}
        />
      ),
    },
    {
      label: "Rich description and a custom icon",
      children: (
        <View
          type="error"
          icon="finances"
          title="2 Missing Costs"
          description={
            <>
              Bid lines missing costs are <b>highlighted below</b>.{" "}
              <a href="https://www.homebound.com" target="_blank" rel="noreferrer" css={Css.blue600.smSb.$}>
                Learn more
              </a>
            </>
          }
        />
      ),
    },
  ];
}

function withItemsExamples(): LabeledExample[] {
  return [
    { label: "Closed", children: <MissingOptionsBanner /> },
    { label: "Open", children: <MissingOptionsBanner defaultExpanded /> },
    {
      label: "No header actions",
      children: (
        <StatusBanner
          type="error"
          title="2 Missing Costs"
          description="Bid lines missing costs are highlighted below."
          items={[{ title: "Framing" }, { title: "Drywall" }]}
        />
      ),
    },
    {
      label: "No header actions, open",
      children: (
        <StatusBanner
          type="error"
          title="2 Missing Costs"
          description="Bid lines missing costs are highlighted below."
          items={[{ title: "Framing" }, { title: "Drywall" }]}
          defaultExpanded
        />
      ),
    },
  ];
}

function bannerTypes(): BannerType[] {
  return ["info", "update", "warning", "error", "success"];
}

function sampleBanner(type: BannerType): PageBannerProps {
  return {
    type,
    title: "Banner Title",
    description: "Banner subcopy goes here. Banner subcopy goes here. Banner subcopy goes here.",
    secondaryAction: { label: "View Details", onClick: noop },
    primaryAction: { label: "Update Costs", onClick: noop },
  };
}

function MissingOptionsBanner({ defaultExpanded }: { defaultExpanded?: boolean }) {
  return (
    <StatusBanner
      type="warning"
      title="Options Missing From Bid Package"
      description="The options listed below contain scope for this cost code."
      secondaryAction={{ label: "Add All", icon: "plus", onClick: noop }}
      items={createItems()}
      defaultExpanded={defaultExpanded}
    />
  );
}

function createItems(): BannerItemProps[] {
  return ["Add Electric Fireplace", "Convert Loft to Bedroom", "Extended Lanai"].map((title) => ({
    title,
    description: <ScopeDetected />,
    actions: [{ label: "Add to Bid", icon: "plus", onClick: noop }],
  }));
}

function StickyBanner(props: PageBannerProps) {
  return <StatusBanner {...props} sticky />;
}

function ScopeDetected(): ReactNode {
  return (
    <>
      Scope detected in{" "}
      <a href="https://www.homebound.com" target="_blank" rel="noreferrer" css={Css.blue600.xsSb.$}>
        Plan 1 - The Sycamore v113, Plan 3 - The Chaney v113, Plan 4 - The Merrick v113
      </a>
    </>
  );
}
