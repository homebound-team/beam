import { ReactNode, useCallback, useState } from "react";
import { Button } from "src/components/Button";
import { FilterDefs, getFilterComponents } from "src/components/Filters";
import { ModalBody, ModalFooter, useModalContext } from "src/components/Modal";
import { Css } from "src/Css";
import { omitKey } from "src/utils";

interface FilterModalProps<F> {
  filter: F;
  filterDefs: FilterDefs<F>;
  modalFilterKeys: (keyof F)[];
  onApply: (f: F) => void;
}

export function FilterModal<F>(props: FilterModalProps<F>) {
  const { filter, filterDefs, onApply, modalFilterKeys } = props;
  const { onClose } = useModalContext();
  // Local copy of the filter that we'll use to manage the modal's state separate from the rest of the Filter
  const [modalFilter, setModalFilter] = useState<F>(filter);

  const updateFilter = useCallback((currentFilter: F, key: keyof F, value: any | undefined) => {
    if (value === undefined || (Array.isArray(value) && value.length === 0)) {
      setModalFilter(omitKey(key, currentFilter));
    } else {
      setModalFilter({ ...currentFilter, [key]: value });
    }
  }, []);

  const filterComponents = getFilterComponents<F>({
    filter: modalFilter,
    filterDefs,
    updateFilter,
    filterKeys: modalFilterKeys,
    inModal: true,
  });

  return (
    <>
      <ModalBody>
        <div css={Css.df.flexColumn.$}>
          {filterComponents.map((c, idx) => (
            <div key={idx}>{c}</div>
          ))}
        </div>
      </ModalBody>
      <ModalFooter xss={Css.justifyBetween.$}>
        <Button
          label="Clear"
          variant="tertiary"
          disabled={modalFilterKeys.filter((fk) => modalFilter[fk] !== undefined).length === 0}
          onClick={() =>
            // Only remove the filters keys that exist in the modal.
            setModalFilter(modalFilterKeys.reduce((acc, fk) => omitKey(fk, acc), modalFilter))
          }
        />
        <div css={Css.df.childGap1.$}>
          <Button label="Cancel" variant="tertiary" onClick={onClose} />
          <Button
            label="Apply"
            onClick={() => {
              onApply(modalFilter);
              onClose();
            }}
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
