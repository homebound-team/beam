import { ListFieldState, ObjectState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { Button, ButtonMenu } from "src/components";
import { Css } from "src/Css";
import { useComputed } from "src/hooks";
import { fail, useTestIds } from "src/utils";
import { BoundFormInputConfig, BoundFormRowInputs, FormRow, listFieldPrefix } from "./BoundForm";

// Helper type to identify array type fields in the input type that contain objects
// Where books: Books[] would be a valid listField, but bookIds: string[] would not
export type ListFieldKey<F> = {
  [K in keyof F]: F[K] extends (infer T)[] | null | undefined ? (T extends object ? K : never) : never;
}[keyof F];

// Helper type to get the nested field keys from the listField input type
export type ListSubFields<F, K extends keyof F> = F[K] extends (infer T)[] | null | undefined ? T : never;

export type ListFieldConfig<F, K extends keyof F> = {
  name: string;
  onNew: (objectState: ListFieldState<ListSubFields<F, K>>) => void;
  rows: BoundFormInputConfig<ListSubFields<F, K>>;
  /** `onDelete` combined with `filterDeleted` specifies how to handle the deletion of a listField row.
   * it is passed the both the top-level `listFieldState` as well as the individual row/record `objectState`.
   * If left blank, the delete action menu will not be shown. */
  onDelete?: (listFieldState: ObjectState<F>[K], rowObjectState: ObjectState<ListSubFields<F, K>>) => void;
  filterDeleted?: (rowObjectState: ObjectState<ListSubFields<F, K>>) => boolean;
};

export function ListField<F>({ row, formState }: { row: BoundFormRowInputs<F>; formState: ObjectState<F> }) {
  const listFieldEntry = Object.entries(row).find(([key, _]) => isListFieldKey(key))!;
  const [prefixedFormKey, fieldConfig] = listFieldEntry;
  // Convert the prefixed listField key back to the original form key by stripping the prefix and lowercasing the first letter
  const listFieldKey = prefixedFormKey.replace(new RegExp(`^listField(.)`), (_, c) =>
    c.toLowerCase(),
  ) as ListFieldKey<F>;
  const listFieldConfig = fieldConfig as ListFieldConfig<F, keyof F>;
  const listFieldObjectState = formState[listFieldKey] as unknown as ListFieldState<ListSubFields<F, keyof F>>;

  const { filterDeleted, onNew } = listFieldConfig;
  const tid = useTestIds({}, "listField");

  const filteredRows = useComputed(
    () =>
      filterDeleted
        ? listFieldObjectState.rows.filter((rowState) => filterDeleted(rowState))
        : listFieldObjectState.rows,
    [filterDeleted],
  );

  // Ensure all list rows are valid (satisfied rules) before allowing the user to add a new row
  const listIsValid = useComputed(() => listFieldObjectState.valid, [filteredRows]);

  return (
    <Observer>
      {() => (
        <div css={Css.df.fdc.gap3.$} {...tid}>
          {filteredRows.map((rowState: ObjectState<ListSubFields<F, keyof F>>, index: number) => (
            <ListFieldRowInputs
              key={`listFieldRowInputs-${listFieldKey}-${index}`}
              rowState={rowState}
              rowNumber={index + 1}
              listFieldConfig={listFieldConfig}
              formState={formState}
              listFieldKey={listFieldKey}
            />
          ))}
          <div>
            <Button
              icon="plus"
              label={`Add ${listFieldConfig.name}`}
              onClick={() => onNew(listFieldObjectState)}
              variant="secondary"
              disabled={!listIsValid}
            />
          </div>
        </div>
      )}
    </Observer>
  );
}

function ListFieldRowInputs<F>({
  rowState,
  rowNumber,
  listFieldConfig,
  formState,
  listFieldKey,
}: {
  rowState: ObjectState<ListSubFields<F, keyof F>>;
  rowNumber: number;
  listFieldConfig: ListFieldConfig<F, keyof F>;
  formState: ObjectState<F>;
  listFieldKey: ListFieldKey<F>;
}) {
  const { onDelete } = listFieldConfig;
  const tid = useTestIds({}, "listFieldRow");

  return (
    <>
      <div css={Css.df.jcsb.$} {...tid}>
        <span css={Css.baseSb.$} {...tid.name}>
          {listFieldConfig.name} {rowNumber}
        </span>
        {onDelete && (
          <ButtonMenu
            trigger={{ icon: "verticalDots" }}
            items={[{ label: "Delete", onClick: () => onDelete(formState[listFieldKey], rowState) }]}
            {...tid.menu}
          />
        )}
      </div>
      {listFieldConfig.rows.map((row, rowIndex) => (
        <FormRow key={`listField-${listFieldKey}-row-${rowIndex}`} row={row} formState={rowState} />
      ))}
    </>
  );
}

export function isListFieldKey(key: string | number | symbol): key is ListFieldKey<unknown> {
  return key.toString().startsWith(listFieldPrefix);
}

export function isListFieldRow<F>(row: BoundFormRowInputs<F>) {
  const rowKeys = Object.keys(row);
  const maybeListFieldKey = rowKeys.find((key) => isListFieldKey(key));
  if (maybeListFieldKey) {
    if (rowKeys.length > 1) fail("List fields cannot be combined with other fields in the same row");
    return true;
  }
  return false;
}
