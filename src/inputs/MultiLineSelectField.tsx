import { useState } from "react";
import { SelectField, Value } from "src/inputs";
import { BeamSelectFieldBaseProps } from "src/inputs/internal/SelectFieldBase";
import { Optional } from "src/types";
import { Button, Css } from "..";

export interface MultiLineSelectFieldProps<O, V extends Value>
  extends Exclude<BeamSelectFieldBaseProps<O, V>, "unsetLabel"> {
  values: V[];
  options: O[];
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  onSelect: (values: V[], opts: O[]) => void;
}

export function MultiLineSelectField<O, V extends Value>(
  props: Optional<MultiLineSelectFieldProps<O, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element {
  const {
    options,
    onSelect,
    values,
    getOptionValue = (opt: O) => (opt as any).id, // if unset, assume O implements HasId
    getOptionLabel = (opt: O) => (opt as any).name, // if unset, assume O implements HasName,
    ...otherProps
  } = props;

  const [isDisplayed, setIsDisplayed] = useState(true);

  return (
    <div css={Css.mt3.$}>
      {values.map((value, index) => {
        return (
          <div css={Css.mb1.pl1.df.$} key={index}>
            <SelectField
              {...otherProps}
              labelStyle="hidden"
              data-testid={`${otherProps.label}SelectField`}
              getOptionValue={getOptionLabel}
              getOptionLabel={getOptionValue}
              value={value}
              onSelect={() => {}}
              options={options}
              compact={true}
              readOnly={true}
            />
            <Button
              data-testid={`delete${otherProps.label}`}
              variant="tertiary"
              label={""}
              aria-label={`Delete selected ${otherProps.label}`}
              icon={"x"}
              onClick={() => {
                // Delete the selected value from the array
                const [selectedValues, selectedOptions] = options
                  .filter((o) => values.includes(getOptionValue(o)))
                  .reduce(
                    (acc, o) => {
                      acc[0].push(getOptionValue(o));
                      acc[1].push(o);
                      return acc;
                    },
                    [[] as V[], [] as O[]],
                  );
                onSelect(selectedValues, selectedOptions);
              }}
            />
          </div>
        );
      })}
      {isDisplayed && (
        <div css={Css.mb1.$}>
          <SelectField
            label={otherProps.label}
            labelStyle="hidden"
            data-testid={`${otherProps.label}SelectField`}
            getOptionValue={getOptionLabel}
            getOptionLabel={getOptionValue}
            value={"" as string}
            onSelect={(value) => {
              onSelect([...values, value], options);
              setIsDisplayed(false);
            }}
            options={options}
            disabled={otherProps.disabled}
          />
        </div>
      )}
      <Button
        data-testid={`addAnother${otherProps.label}`}
        label={`Add Another ${otherProps.label}`}
        variant="tertiary"
        onClick={() => setIsDisplayed(true)}
        // What happens for it to be disabled?
        disabled={false}
      />
    </div>
  );
}
