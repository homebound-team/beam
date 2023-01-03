import { useState } from "react";
import { Button } from "src/components/Button";
import { SelectField, Value } from "src/inputs";
import { BeamSelectFieldBaseProps } from "src/inputs/internal/SelectFieldBase";
import { Optional } from "src/types";
import { Css } from "..";

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
    getOptionValue = (opt: O) => (opt as any).id,
    getOptionLabel = (opt: O) => (opt as any).name,
    ...otherProps
  } = props;

  const [isDisplayed, setIsDisplayed] = useState(true);
  const [currentOptions, setCurrentOptions] = useState(options.filter((o) => !values.includes(getOptionValue(o))));

  return (
    <div css={Css.mt1.$}>
      {values.map((value, index) => {
        return (
          <div css={Css.mb1.pl1.df.$} key={index}>
            <div css={Css.truncate.w100.$}>
              <SelectField
                {...otherProps}
                labelStyle="hidden"
                data-testid="selectField"
                value={value}
                onSelect={() => {}}
                options={options}
                getOptionValue={getOptionValue}
                getOptionLabel={getOptionLabel}
                compact={true}
                readOnly={true}
              />
            </div>
            <Button
              data-testid="deleteSelected"
              variant="tertiary"
              label={""}
              aria-label={`Delete selected ${otherProps.label}`}
              icon={"x"}
              onClick={() => {
                // Delete the selected value from the array
                const [selectedValues, selectedOptions] = options
                  .filter((o) => values.filter((v) => v !== value).includes(getOptionValue(o)))
                  .reduce(
                    (acc, o) => {
                      acc[0].push(getOptionValue(o));
                      acc[1].push(o);
                      return acc;
                    },
                    [[] as V[], [] as O[]],
                  );

                onSelect(selectedValues, selectedOptions);
                setCurrentOptions(options.filter((o) => !selectedOptions.includes(o)));
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
            data-testid="selectField"
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            value={"" as string}
            onSelect={(value) => {
              onSelect([...values, value], options);
              setCurrentOptions(currentOptions.filter((o) => getOptionValue(o) !== value));
              setIsDisplayed(false);
            }}
            options={currentOptions}
            disabled={otherProps.disabled}
          />
        </div>
      )}
      <Button
        data-testid="addAnother"
        label={`Add Another ${otherProps.label}`}
        variant="tertiary"
        onClick={() => setIsDisplayed(true)}
        disabled={isDisplayed || currentOptions.length === 0}
      />
    </div>
  );
}
