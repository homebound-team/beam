import { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";
import { GridSelectCard, GridSelectCardProps } from "src/inputs/SelectCard/GridSelectCard";
import { getSelectCardOptionsCss } from "./utils";

export default {
  component: GridSelectCard,
} as Meta<GridSelectCardProps>;

export function States() {
  const description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";

  return (
    <div css={Css.df.fdc.gap4.wPx(640).$}>
      <h2 css={Css.lg.$}>Without description</h2>
      <div css={getSelectCardOptionsCss("grid", false)}>
        <GridSelectCardWrapper label="Default" icon="columns" />
        <GridSelectCardWrapper label="Selected" icon="columns" selected />
        <GridSelectCardWrapper label="Disabled" icon="columns" disabled />
        <GridSelectCardWrapper label="Disabled selected" icon="columns" selected disabled />
        <GridSelectCardWrapper label="Hover" icon="columns" __storyState={{ hovered: true }} />
        <GridSelectCardWrapper label="Hover selected" icon="columns" selected __storyState={{ hovered: true }} />
        <GridSelectCardWrapper label="Focus" icon="columns" __storyState={{ focusVisible: true }} />
        <GridSelectCardWrapper label="Focus selected" icon="columns" selected __storyState={{ focusVisible: true }} />
        <GridSelectCardWrapper label="Pressed" icon="columns" __storyState={{ pressed: true }} />
        <GridSelectCardWrapper label="Pressed selected" icon="columns" selected __storyState={{ pressed: true }} />
      </div>

      <h2 css={Css.lg.$}>With description</h2>
      <div css={getSelectCardOptionsCss("grid", true)}>
        <GridSelectCardWrapper label="Default" icon="single" description={description} />
        <GridSelectCardWrapper label="Selected" icon="single" description={description} selected />
        <GridSelectCardWrapper
          label="Pressed"
          icon="single"
          description={description}
          __storyState={{ pressed: true }}
        />
        <GridSelectCardWrapper
          label="Pressed selected"
          icon="single"
          description={description}
          selected
          __storyState={{ pressed: true }}
        />
        <GridSelectCardWrapper label="Disabled" icon="single" description={description} disabled />
        <GridSelectCardWrapper label="Disabled selected" icon="single" description={description} selected disabled />
        <GridSelectCardWrapper
          label="Disabled with tooltip"
          icon="linked"
          description={description}
          disabled
          tooltip="Type cannot be modified for existing options"
        />
      </div>
    </div>
  );
}

/** Mix of cards with and without descriptions in one row. */
export function MixedDescriptions() {
  const description = "Slots share the same options, but each slot can have its own selection.";

  return (
    <div css={{ ...Css.wPx(640).$, ...getSelectCardOptionsCss("grid", true) }}>
      <GridSelectCardWrapper label="Single" icon="single" description={description} selected />
      <GridSelectCardWrapper label="Math" icon="abacus" />
      <GridSelectCardWrapper label="Package" icon="package" description="Selections come in preconfigured bundles." />
      <GridSelectCardWrapper label="Finance" icon="dollar" />
    </div>
  );
}

type GridSelectCardWrapperProps = Omit<GridSelectCardProps, "inputProps">;

function GridSelectCardWrapper(props: GridSelectCardWrapperProps) {
  return <GridSelectCard {...props} inputProps={{ readOnly: true, "aria-hidden": true }} />;
}
