import { type ReactNode, useState } from "react";
import { Button } from "src/components/Button";
import type { Filter, FilterImpls } from "src/components/Filters/types";
import { filterTestIdPrefix, updateFilter } from "src/components/Filters/utils";
import { ModalBody, ModalFooter, ModalHeader } from "src/components/Modal/Modal";
import { useModal } from "src/components/Modal/useModal";
import { Css } from "src/Css";
import { omitKey, safeEntries, safeKeys } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";

interface FilterModalProps<F> {
  filter: F;
  /** The filters to render in the modal; other keys of `filter` are kept as-is. */
  filters: FilterImpls<F>;
  /** Called with the full filter when the user clicks Apply. */
  onApply: (f: F) => void;
}

/** The "More Filters" modal content: edits a local copy of `filter` and only reports it on Apply. */
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
                false,
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
        <div css={Css.df.gap1.$}>
          <Button label="Cancel" variant="quaternary" onClick={closeModal} {...testId.modalClose} />
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

/** Wraps one filter in `FilterModal` under an `h2` label, or a top divider when there's no label. */
export function ModalFilterItem({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div css={Css.mb4.if(!label).bt.bcGray200.$}>
      {label && <h2 css={Css.md.mb2.$}>{label}</h2>}
      <div css={Css.if(!label).pt3.$}>{children}</div>
    </div>
  );
}
