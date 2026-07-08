import { VisuallyHidden } from "react-aria";
import { Css, Tokens } from "src/Css";
import { StyledCheckbox } from "src/inputs/CheckboxBase";
import { SelectCardShell } from "src/inputs/SelectCard/SelectCardShell";
import { StyledRadio } from "src/inputs/SelectCard/StyledRadio";
import { SelectCardItemProps } from "src/inputs/SelectCard/types";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

/** Internal list-view card with checkbox or radio leading control. */
export function ListSelectCard(props: SelectCardItemProps) {
  const {
    label,
    description,
    selected: isSelected = false,
    disabled: isDisabled = false,
    tooltip,
    inputProps,
    __storyState,
    ...others
  } = props;

  const tid = useTestIds(others, defaultTestId(label));

  return (
    <SelectCardShell
      label={label}
      selected={isSelected}
      disabled={isDisabled}
      tooltip={tooltip}
      view="list"
      __storyState={__storyState}
      {...others}
    >
      <div css={Css.df.aic.gap1.$}>
        {inputProps.type === "checkbox" ? (
          <>
            {/* Styled checkbox is just a span, so we need to wrap the input in a visually hidden element */}
            <VisuallyHidden>
              <input {...inputProps} {...tid.value} />
            </VisuallyHidden>
            {/* Not adding isFocusVisible prop as we show the focus ring on the card itself */}
            <StyledCheckbox isDisabled={isDisabled} isSelected={isSelected} />
          </>
        ) : (
          // Styled radio is an input, so we can use the inputProps directly
          <StyledRadio {...tid} label={label} isDisabled={isDisabled} isSelected={isSelected} inputProps={inputProps} />
        )}
        <span css={Css.smSb.color(Tokens.OnSurface).if(isDisabled).gray600.$}>{label}</span>
      </div>
      {description && <span css={Css.ml3.xs.color(Tokens.OnSurface).if(isDisabled).gray600.$}>{description}</span>}
    </SelectCardShell>
  );
}
