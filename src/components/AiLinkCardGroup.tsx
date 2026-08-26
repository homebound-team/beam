import { AiPanel } from "src/components/AiPanel";
import { LinkCard, LinkCardProps } from "src/components/LinkCard";
import { BlueprintAiLogo } from "src/components/Logos";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

export type AiLinkCardGroupProps = {
  cards: LinkCardProps[];
};

/**
 * A stack of {@link LinkCard}s on the AI surface, each linking to the finding it describes.
 *
 * Renders nothing when `cards` is empty.
 */
export function AiLinkCardGroup(props: AiLinkCardGroupProps) {
  const { cards } = props;
  const tid = useTestIds(props, "aiLinkCardGroup");
  if (cards.length === 0) return null;
  return (
    <AiPanel padding="lg" {...tid}>
      <div css={Css.df.fdc.aifs.gap2.w100.$}>
        <BlueprintAiLogo height={3} />
        {cards.map((card) => (
          <LinkCard key={card.title} {...card} />
        ))}
      </div>
    </AiPanel>
  );
}
