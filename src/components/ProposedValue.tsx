import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type ProposedValueProps = {
  /** The value on record, struck-through. */
  original?: string;
  /** The AI's proposal, i.e. the value now standing. */
  proposed: string;
};

/**
 * Renders an AI proposal as `original proposed`, with the value on record struck through.
 *
 * For read-only surfaces, i.e. card data blocks and table cells. Editable fields instead style the
 * input's own text so the proposal survives focus — see `TextFieldBase`.
 */
export function ProposedValue(props: ProposedValueProps) {
  const { original, proposed } = props;
  const tid = useTestIds(props, "proposedValue");
  return (
    <span {...tid}>
      {original && (
        <>
          <span css={Css.tdlt.color(Tokens.OnSurfaceMuted).$} {...tid.original}>
            {original}
          </span>{" "}
        </>
      )}
      <span css={Css.fw6.color(Tokens.AiFieldFg).$} {...tid.proposed}>
        {proposed}
      </span>
    </span>
  );
}
