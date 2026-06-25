import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { Css, Palette, SelectCard, SelectCardProps } from "src";

export default {
  component: SelectCard,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Component-Library?node-id=49143-27867&m=dev",
    },
  },
} as Meta<SelectCardProps>;

const description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";

export function Default() {
  return (
    <div css={Css.df.fdc.gap4.$}>
      <div css={Css.df.gap2.jcfs.aifs.$}>
        <State title="Default">
          <SelectCard icon="kanban" label="This is a title" description={description} onChange={() => {}} />
        </State>
        <State title="Selected">
          <SelectCard icon="kanban" label="This is a title" description={description} selected onChange={() => {}} />
        </State>
        <State title="Hover">
          <HoveredSelectCard icon="kanban" label="This is a title" description={description} onChange={() => {}} />
        </State>
        <State title="Disabled">
          <SelectCard icon="kanban" label="This is a title" description={description} disabled onChange={() => {}} />
        </State>
        <State title="Disabled selected">
          <SelectCard
            icon="kanban"
            label="This is a title"
            description={description}
            disabled
            selected
            onChange={() => {}}
          />
        </State>
      </div>
      <div css={Css.df.gap2.jcfs.aifs.$}>
        <State title="Without description">
          <SelectCard icon="kanban" label="Architectural Design" onChange={() => {}} />
        </State>
      </div>
    </div>
  );
}

function State({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 css={Css.smSb.mb1.$}>{title}</h3>
      {children}
    </div>
  );
}

/** Hover styled version of the SelectCard — uses a scoped stylesheet to force hover styles for visual testing. */
function HoveredSelectCard(args: SelectCardProps) {
  return (
    <div className="hovered-select-card">
      <style>{`.hovered-select-card button { border-width: 2px; border-color: ${Palette.Blue600}; }`}</style>
      <SelectCard {...args} />
    </div>
  );
}
