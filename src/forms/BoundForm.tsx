import { FieldState, ObjectState } from "@homebound/form-state";
import { ReactNode, useMemo } from "react";
import { LoadingSkeleton } from "src/components";
import { Css, Only, Properties } from "src/Css";
import { useComputed } from "src/hooks";
import { Value } from "src/inputs/Value";
import { TextFieldXss } from "src/interfaces";
import { fail, safeEntries, useTestIds } from "src/utils";
import { BoundCheckboxField, BoundCheckboxFieldProps } from "./BoundCheckboxField";
import { BoundCheckboxGroupField, BoundCheckboxGroupFieldProps } from "./BoundCheckboxGroupField";
import { BoundDateField, BoundDateFieldProps } from "./BoundDateField";
import { BoundDateRangeField, BoundDateRangeFieldProps } from "./BoundDateRangeField";
import { BoundIconCardField, BoundIconCardFieldProps } from "./BoundIconCardField";
import { BoundIconCardGroupField, BoundIconCardGroupFieldProps } from "./BoundIconCardGroupField";
import { BoundMultiLineSelectField, BoundMultiLineSelectFieldProps } from "./BoundMultiLineSelectField";
import { BoundMultiSelectField, BoundMultiSelectFieldProps } from "./BoundMultiSelectField";
import { BoundNumberField, BoundNumberFieldProps } from "./BoundNumberField";
import { BoundRadioGroupField, BoundRadioGroupFieldProps } from "./BoundRadioGroupField";
import { BoundRichTextField, BoundRichTextFieldProps } from "./BoundRichTextField";
import { BoundSelectField, BoundSelectFieldProps } from "./BoundSelectField";
import { BoundSwitchField, BoundSwitchFieldProps } from "./BoundSwitchField";
import { BoundTextAreaField, BoundTextAreaFieldProps } from "./BoundTextAreaField";
import { BoundTextField, BoundTextFieldProps } from "./BoundTextField";
import { BoundToggleChipGroupField, BoundToggleChipGroupFieldProps } from "./BoundToggleChipGroupField";
import { BoundTreeSelectField, BoundTreeSelectFieldProps } from "./BoundTreeSelectField";
import { FormLines } from "./FormLines";

type BoundFieldInputFnReturn = { component: ReactNode; minWidth: Properties["minWidth"] };
type BoundFieldInputFn<F> = (field: ObjectState<F>[keyof F]) => BoundFieldInputFnReturn;

// To aid in discoverability of the optional override via IntelliSense, we can enumerate each form key `foo`
// as `reactNodeFoo` as well as allow for any non-form key related `reactNodeBar` to be rendered as-is.
type CapitalizeFirstLetter<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${Uppercase<First>}${Rest}`
  : S;
const reactNodePrefix = "reactNode";
type TReactNodePrefix<S extends string> = `${typeof reactNodePrefix}${CapitalizeFirstLetter<S>}`;

type CustomReactNodeKey = `${typeof reactNodePrefix}${string}`;

type BoundFormRowInputs<F> = Partial<{
  [K in keyof F]: BoundFieldInputFn<F>;
}> & {
  [K in CustomReactNodeKey]: ReactNode;
} & {
  [K in keyof F as TReactNodePrefix<K & string>]: ReactNode;
};

export type BoundFormInputConfig<F> = BoundFormRowInputs<F>[];

export type BoundFormProps<F> = {
  rows: BoundFormInputConfig<F>;
  formState: ObjectState<F>;
};

/**
 * A wrapper around the "Bound" form components for the form-state library to render a standard (and responsive) form layout.
 * * Each row is an object of bound input components keyed by their formState key, which are rendered in a responsive flex layout.
 * * Alternatively keys can be prefixed with "reactNode" to render any custom JSX node as-is.
 * * Example usage:
 * ```tsx
 *    <BoundFormComponent
        rows={[
          { firstName: boundTextField(), middleInitial: boundTextField(), lastName: boundTextField() },
          { bio: boundTextAreaField() },
          { reactNodeExample: <div>Custom JSX node</div> },
        ]}
        formState={formState}
      />
 * ```
 */
export function BoundForm<F>(props: BoundFormProps<F>) {
  const { rows, formState } = props;

  const tid = useTestIds({}, "boundForm");

  return (
    <div {...tid}>
      <FormLines labelSuffix={{ required: "*" }} width="full" gap={4}>
        {rows.map((row) => (
          <FormRow key={`fieldGroup-${Object.keys(row).join("-")}`} row={row} formState={formState} />
        ))}
      </FormLines>
    </div>
  );
}

function FormRow<F>({ row, formState }: { row: BoundFormRowInputs<F>; formState: ObjectState<F> }) {
  const tid = useTestIds({}, "boundFormRow");

  /**  Extract the bound input components with their sizing config or render any "custom" JSX node as-is */
  const componentsWithConfig = useMemo(() => {
    return safeEntries(row).map(([key, fieldFnOrCustomNode]) => {
      if (typeof fieldFnOrCustomNode === "function" && !isCustomReactNodeKey(key)) {
        const field = formState[key] ?? fail(`Field ${key.toString()} not found in formState`);
        const fieldFn =
          (fieldFnOrCustomNode as BoundFormRowInputs<F>[keyof F]) ??
          fail(`Field function not defined for key ${key.toLocaleString()}`);
        const { component, minWidth } = fieldFn(field);

        return { component, key, minWidth };
      }

      return { component: fieldFnOrCustomNode as ReactNode, key };
    });
  }, [row, formState]);

  // We can hook into the formState loading state and show a skeleton from that matches the real forms layout
  const isLoading = useComputed(() => formState.loading, [formState]);

  // Prefer to evenly distribute the available space to each item, but leave some room for the "gap" padding
  // Then fall back to each item's "min-width" to allow for input-specific sizing when the available space is small
  const itemFlexBasis = 100 / componentsWithConfig.length - 3;

  return (
    <div css={Css.df.fww.gap2.$} {...tid}>
      {componentsWithConfig.map(({ component, key, minWidth }) => (
        <div css={Css.mw(minWidth).fb(`${itemFlexBasis}%`).fg1.$} key={key.toString()}>
          {isLoading ? <LoadingSkeleton size="lg" /> : component}
        </div>
      ))}
    </div>
  );
}

function isCustomReactNodeKey(key: string | number | symbol): key is CustomReactNodeKey {
  return key.toString().startsWith(reactNodePrefix);
}

/**
 * These field component functions are thin wrappers around the `BoundFoo` components which omit
 * certain props that the caller doesn't need to pass or we specifically want to restrict to drive UX consistency.
 */

// We map the `field` to the bound component automatically for the caller.
type KeysToOmit = "field";

// Potential TODO: add type overloads for the different HasIdIsh/HasNameIsh combinations, maybe there's a generic way to introspect those types?
export function boundSelectField<O, V extends Value>(props: Omit<BoundSelectFieldProps<O, V>, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundSelectField field={field} {...props} />,
    minWidth: "200px",
  });
}

export function boundMultiSelectField<O, V extends Value>(props: Omit<BoundMultiSelectFieldProps<O, V>, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundMultiSelectField field={field} {...props} />,
    minWidth: "200px",
  });
}

export function boundMultilineSelectField<O, V extends Value>(
  props: Omit<BoundMultiLineSelectFieldProps<O, V>, KeysToOmit>,
) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundMultiLineSelectField field={field} {...props} />,
    minWidth: "200px",
  });
}

export function boundTextField<X extends Only<TextFieldXss, X>>(props?: Omit<BoundTextFieldProps<X>, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundTextField field={field} {...props} />,
    minWidth: "150px",
  });
}

export function boundTextAreaField<X extends Only<TextFieldXss, X>>(
  props?: Omit<BoundTextAreaFieldProps<X>, KeysToOmit>,
) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundTextAreaField field={field} {...props} />,
    minWidth: "200px",
  });
}

export function boundNumberField(props?: Omit<BoundNumberFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundNumberField field={field} {...props} />,
    minWidth: "150px",
  });
}

export function boundDateField(props?: Omit<BoundDateFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundDateField field={field} {...props} />,
    minWidth: "150px",
  });
}

export function boundDateRangeField(props?: Omit<BoundDateRangeFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundDateRangeField field={field} {...props} />,
    minWidth: "150px",
  });
}

export function boundCheckboxField(props?: Omit<BoundCheckboxFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundCheckboxField field={field} {...props} />,
    minWidth: "min-content",
  });
}

export function boundCheckboxGroupField(props: Omit<BoundCheckboxGroupFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundCheckboxGroupField field={field} {...props} />,
    minWidth: "200px",
  });
}

export function boundIconCardField(props: Omit<BoundIconCardFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundIconCardField field={field} {...props} />,
    minWidth: "150px",
  });
}

export function boundIconCardGroupField<V extends Value>(props: Omit<BoundIconCardGroupFieldProps<V>, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundIconCardGroupField field={field} {...props} />,
    minWidth: "100%",
  });
}

export function boundRadioGroupField<K extends string>(props: Omit<BoundRadioGroupFieldProps<K>, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundRadioGroupField field={field} {...props} />,
    minWidth: "200px",
  });
}

export function boundRichTextField(props?: Omit<BoundRichTextFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundRichTextField field={field} {...props} />,
    minWidth: "200px",
  });
}

export function boundSwitchField(props?: Omit<BoundSwitchFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundSwitchField field={field} labelStyle="inline" {...props} />,
    minWidth: "min-content",
  });
}

export function boundToggleChipGroupField(props: Omit<BoundToggleChipGroupFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundToggleChipGroupField field={field} {...props} />,
    minWidth: "100%",
  });
}

export function boundTreeSelectField<O, V extends Value>(props: Omit<BoundTreeSelectFieldProps<O, V>, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundTreeSelectField field={field} {...props} />,
    minWidth: "200px",
  });
}
