import { ReactNode, useMemo, useState } from "react";
import { Button } from "src/components/Button";
import { filterBuilder, FilterDefs, filterTestIdPrefix, getFilterComponents } from "src/components/Filters";
import { ModalBody, ModalFooter, ModalHeader, useModal } from "src/components/Modal";
import { Css } from "src/Css";
import { omitKey, safeKeys, useTestIds } from "src/utils";

interface FilterModalProps<F> {
  filter: F;
  filterDefs: FilterDefs<F>;
  onApply: (f: F) => void;
}

export function FilterModal<F>(props: FilterModalProps<F>) {
  const { filter, filterDefs, onApply } = props;
  const testId = useTestIds(props, filterTestIdPrefix);
  const { closeModal } = useModal();
  // Local copy of the filter that we'll use to manage the modal's state separate from the rest of the Filter
  const [modalFilter, setModalFilter] = useState<F>(filter);
  const updateFilter = useMemo(() => filterBuilder(setModalFilter, filterDefs), []);

  const filterComponents = getFilterComponents<F>({
    filter: modalFilter,
    filterDefs,
    updateFilter,
    inModal: true,
  });

  return (
    <>
      <ModalHeader>More Filters</ModalHeader>
      <ModalBody>
        <div css={Css.df.fdc.$}>
          {filterComponents.map((c, idx) => (
            <div key={idx}>{c}</div>
          ))}
        </div>
      </ModalBody>
      <ModalFooter xss={Css.jcsb.$}>
        <Button
          label="Clear"
          variant="tertiary"
          disabled={safeKeys(filterDefs).filter((fk) => modalFilter[fk] !== undefined).length === 0}
          onClick={() =>
            // Only remove the filters keys that exist in the modal.
            setModalFilter(safeKeys(filterDefs).reduce((acc, fk) => omitKey(fk, acc), modalFilter))
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
