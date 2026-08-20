import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

type ProposedValueProps = {
  /** The value on record, struck-through. */
  original?: string;
  /** The AI's proposal, i.e. the value the field is actually holding. */
  proposed: string;
};

/**
 * Renders a field's AI proposal as `original proposed`, with the original struck through.
 *
 * Only used on the read-only path, which renders no input. Editable fields instead style the input's
 * own text and render the original as a sibling, so it survives focus. See `TextFieldBase`.
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
