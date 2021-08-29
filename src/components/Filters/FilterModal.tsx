import { ReactNode, useState } from "react";
import { Button } from "src/components/Button";
import { Filter, FilterImpls, filterTestIdPrefix, updateFilter } from "src/components/Filters";
import { ModalBody, ModalFooter, ModalHeader, useModal } from "src/components/Modal";
import { Css } from "src/Css";
import { omitKey, safeEntries, safeKeys, useTestIds } from "src/utils";

interface FilterModalProps<F> {
  filter: F;
  filters: FilterImpls<F>;
  onApply: (f: F) => void;
}

export function FilterModal<F>(props: FilterModalProps<F>) {
  const { filter, filters, onApply } = props;
  const testId = useTestIds(props, filterTestIdPrefix);
  const { closeModal } = useModal();
  // Local copy of the filter that we'll use to manage the modal's state separate from the rest of the Filter
  const [modalFilter, setModalFilter] = useState<F>(filter);

  return (
    <>
      <ModalHeader>More Filters</ModalHeader>
      <ModalBody>
        <div css={Css.df.fdc.$}>
          {safeEntries(filters).map(([key, f]: [keyof F, Filter<any>]) => (
            <ModalFilterItem key={key as string} label={f.hideLabelInModal ? undefined : f.label}>
              {f.render(
                modalFilter[key],
                (value) => setModalFilter(updateFilter(modalFilter, key, value)),
                testId,
                true,
              )}
            </ModalFilterItem>
          ))}
        </div>
      </ModalBody>
      <ModalFooter xss={Css.jcsb.$}>
        <Button
          label="Clear"
          variant="tertiary"
          disabled={safeKeys(filters).filter((fk) => modalFilter[fk] !== undefined).length === 0}
          onClick={() =>
            // Only remove the filters keys that exist in the modal.
            setModalFilter(safeKeys(filters).reduce((acc, fk) => omitKey(fk, acc), modalFilter))
          }
          {...testId.modalClear}
        />
        <div css={Css.df.childGap1.$}>
          <Button label="Cancel" variant="tertiary" onClick={closeModal} {...testId.modalClose} />
          <Button
            label="Apply"
            onClick={() => {
              onApply(modalFilter);
              closeModal();
            }}
            {...testId.modalApply}
          />
        </div>
      </ModalFooter>
    </>
  );
}

// Wraps a filter component to be displayed in the Filter Modal
export function ModalFilterItem({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div css={Css.mb4.if(!label).bt.bGray200.$}>
      {label && <h2 css={Css.baseEm.mb2.$}>{label}</h2>}
      <div css={Css.if(!label).pt3.$}>{children}</div>
    </div>
  );
}
