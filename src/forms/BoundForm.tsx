import { FieldState, ListFieldState, ObjectState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { ReactNode, useCallback, useMemo } from "react";
import { Button, ButtonMenu, LoadingSkeleton } from "src/components";
import { Css, Only, Properties } from "src/Css";
import { useComputed } from "src/hooks";
import { Value } from "src/inputs/Value";
import { TextFieldXss } from "src/interfaces";
import { fail, useTestIds } from "src/utils";
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

const listFieldPrefix = "listField";
type TListFieldPrefix<S extends string> = `${typeof listFieldPrefix}${CapitalizeFirstLetter<S>}`;
// Helper type to identify array type fields in the input type that contain objects
// Where books: Books[] would be a valid listField, but bookIds: string[] would not
type ListFieldKey<F> = {
  [K in keyof F]: F[K] extends (infer T)[] | null | undefined ? (T extends object ? K : never) : never;
}[keyof F];

// Helper type to get the nested field keys from the listField input type
type ListSubFields<F, K extends keyof F> = F[K] extends (infer T)[] | null | undefined ? T : never;

type ListFieldConfig<F, K extends keyof F> = {
  name: string;
  defaultValues: ListSubFields<F, K>;
  rows: BoundFormInputConfig<ListSubFields<F, K>>;
  onDelete?: (field: ObjectState<F>[K], objectState: ObjectState<ListSubFields<F, K>>) => void;
  filterDeleted?: (objectState: ObjectState<ListSubFields<F, K>>) => boolean;
};

type BoundFormRowInputs<F> = Partial<
  {
    [K in keyof F]: BoundFieldInputFn<F>;
  } & {
    [K in CustomReactNodeKey]: ReactNode;
  } & {
    [K in keyof F as TReactNodePrefix<K & string>]: ReactNode;
  } & {
    [K in ListFieldKey<F> as TListFieldPrefix<K & string>]: ListFieldConfig<F, K>;
  }
>;

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
      <FormLines width="full" gap={3.5}>
        {rows.map((row) =>
          isListFieldRow(row) ? (
            <ListField key={getRowKey(row, "listField")} row={row} formState={formState} />
          ) : (
            <FormRow key={getRowKey(row, "fieldGroup")} row={row} formState={formState} />
          ),
        )}
      </FormLines>
    </div>
  );
}

function getRowKey<F>(row: BoundFormRowInputs<F>, rowType: string) {
  return `${rowType}-${Object.keys(row).join("-")}`;
}

function isListFieldRow<F>(row: BoundFormRowInputs<F>) {
  const rowKeys = Object.keys(row);
  const maybeListFieldKey = rowKeys.find((key) => isListFieldKey(key));
  if (maybeListFieldKey) {
    if (rowKeys.length > 1) fail("List fields cannot be combined with other fields in the same row");
    return true;
  }
  return false;
}

function FormRow<F>({ row, formState }: { row: BoundFormRowInputs<F>; formState: ObjectState<F> }) {
  const tid = useTestIds({}, "boundFormRow");

  /** Extract the bound input components with their sizing config or render any "custom" JSX node as-is */
  const componentsWithConfig = useMemo(() => {
    return Object.entries(row).map(([key, fieldFnOrCustomNode]) => {
      if (typeof fieldFnOrCustomNode === "function" && !isCustomReactNodeKey(key)) {
        const field = formState[key as keyof F] ?? fail(`Field ${key.toString()} not found in formState`);
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

function ListField<F>({ row, formState }: { row: BoundFormRowInputs<F>; formState: ObjectState<F> }) {
  const listFieldEntry = Object.entries(row).find(([key, _]) => isListFieldKey(key))!;
  const [prefixedFormKey, fieldConfig] = listFieldEntry;
  // Convert the prefixed listField key back to the original form key by stripping the prefix and lowercasing the first letter
  const listFieldKey = prefixedFormKey.replace(new RegExp(`^${listFieldPrefix}(.)`), (_, c) =>
    c.toLowerCase(),
  ) as ListFieldKey<F>;
  const listFieldConfig = fieldConfig as ListFieldConfig<F, keyof F>;
  const listFieldObjectState = formState[listFieldKey] as unknown as ListFieldState<ListSubFields<F, keyof F>>;

  const { filterDeleted } = listFieldConfig;

  const filteredRows = useComputed(
    () =>
      filterDeleted
        ? listFieldObjectState.rows.filter((rowState) => filterDeleted(rowState))
        : listFieldObjectState.rows,
    [filterDeleted],
  );

  return (
    <Observer>
      {() => (
        <div css={Css.df.fdc.gap3.$}>
          {filteredRows.map((rowState: ObjectState<ListSubFields<F, keyof F>>, index: number) => (
            <ListFieldRowInputs
              key={`listFieldRowInputs-${listFieldKey}-${index}`}
              rowState={rowState}
              index={index}
              listFieldConfig={listFieldConfig}
              formState={formState}
              listFieldKey={listFieldKey}
            />
          ))}
          <div>
            <Button
              icon="plus"
              label={`Add ${listFieldConfig.name}`}
              onClick={() => listFieldObjectState.add(Object.assign({}, listFieldConfig.defaultValues))}
              variant="secondary"
            />
          </div>
        </div>
      )}
    </Observer>
  );
}

function ListFieldRowInputs<F>({
  rowState,
  index,
  listFieldConfig,
  formState,
  listFieldKey,
}: {
  rowState: ObjectState<ListSubFields<F, keyof F>>;
  index: number;
  listFieldConfig: ListFieldConfig<F, keyof F>;
  formState: ObjectState<F>;
  listFieldKey: ListFieldKey<F>;
}) {
  const { onDelete } = listFieldConfig;

  const onRowDelete = useCallback(() => {
    if (!onDelete) return;
    onDelete(formState[listFieldKey], rowState);
  }, [onDelete, formState, listFieldKey, rowState]);

  return (
    <>
      <div css={Css.df.jcsb.$}>
        <span css={Css.baseSb.$}>
          {listFieldConfig.name} {index + 1}
        </span>
        {onDelete && (
          <ButtonMenu trigger={{ icon: "verticalDots" }} items={[{ label: "Delete", onClick: onRowDelete }]} />
        )}
      </div>
      {listFieldConfig.rows.map((row) => (
        <FormRow key={getRowKey(row, `listField-row-${index}`)} row={row} formState={rowState} />
      ))}
    </>
  );
}

function isCustomReactNodeKey(key: string | number | symbol): key is CustomReactNodeKey {
  return key.toString().startsWith(reactNodePrefix);
}

function isListFieldKey(key: string | number | symbol): key is ListFieldKey<unknown> {
  return key.toString().startsWith(listFieldPrefix);
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
