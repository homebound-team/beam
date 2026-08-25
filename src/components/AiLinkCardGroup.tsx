import { AiPanel } from "src/components/AiPanel";
import { LinkCard, LinkCardProps } from "src/components/LinkCard";
import { BlueprintAiLogo } from "src/components/Logos";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

export type AiLinkCardGroupProps = {
  cards: LinkCardProps[];
};

/**
 * A stack of AI-surfaced findings, each linking to with a relevant action callback.
 */
export function AiLinkCardGroup(props: AiLinkCardGroupProps) {
  const { cards } = props;
  const tid = useTestIds(props, "aiLinkCardGroup");
  return (
    <AiPanel padding="lg" {...tid}>
      <div css={Css.df.fdc.aifs.gap2.w100.$}>
        <BlueprintAiLogo height={3} />
        {cards.map((card, i) => (
          <LinkCard key={`cardGroup_${card.title}_card`} {...card} />
        ))}
      </div>
    </AiPanel>
  );
}
