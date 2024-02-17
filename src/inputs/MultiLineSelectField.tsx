import { useState } from "react";
import { Button } from "src/components/Button";
import { Label } from "src/components/Label";
import { SelectField, Value } from "src/inputs";
import { ComboBoxBaseProps } from "src/inputs/internal/ComboBoxBase";
import { Optional } from "src/types";
import { Css, useTestIds } from "..";

export interface MultiLineSelectFieldProps<O, V extends Value> extends Exclude<ComboBoxBaseProps<O, V>, "unsetLabel"> {
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
    values,
    onSelect,
    getOptionValue = (opt: O) => (opt as any).id,
    getOptionLabel = (opt: O) => (opt as any).name,
    labelStyle,
    ...otherProps
  } = props;

  const tid = useTestIds(props, "");
  const [isDisplayed, setIsDisplayed] = useState(true);

  // Set the available options by filtering already selected options
  const currentOptions = options.filter((o) => !values.includes(getOptionValue(o)));

  return (
    <div css={Css.mt1.if(labelStyle === "left").df.$}>
      {labelStyle !== "hidden" && (
        <div css={Css.if(labelStyle === "left").w50.$}>
          <Label {...tid.label} label={props.label} />
        </div>
      )}
      <div css={Css.if(labelStyle === "left").w50.$}>
        {values.map((value, index) => {
          return (
            <div css={Css.mb1.pl1.df.$} key={index}>
              <div css={Css.truncate.w100.$}>
                <SelectField
                  {...otherProps}
                  {...tid.selectField}
                  labelStyle="hidden"
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
                {...tid.deleteSelected}
                variant="tertiary"
                label={""}
                aria-label={`Delete selected ${otherProps.label}`}
                icon={"x"}
                onClick={() => {
                  const selectedOptions = options.filter(
                    (o) => values.includes(getOptionValue(o)) && getOptionValue(o) !== value,
                  );
                  const selectedValues = selectedOptions.map((o) => getOptionValue(o));

                  onSelect(selectedValues, selectedOptions);
                  // Display the input field if there are no selected values
                  if (selectedOptions.length === 0) setIsDisplayed(true);
                }}
              />
            </div>
          );
        })}
        {isDisplayed && (
          <div css={Css.mb1.$}>
            <SelectField
              {...tid.selectField}
              label={otherProps.label}
              labelStyle="hidden"
              getOptionValue={getOptionValue}
              getOptionLabel={getOptionLabel}
              value={"" as string}
              onSelect={(value) => {
                onSelect([...values, value], options);
                setIsDisplayed(false);
              }}
              options={currentOptions}
              disabled={otherProps.disabled}
            />
          </div>
        )}
        <Button
          {...tid.addAnother}
          label="Add Another"
          variant="tertiary"
          onClick={() => setIsDisplayed(true)}
          disabled={isDisplayed || currentOptions.length === 0}
        />
      </div>
    </div>
  );
}
