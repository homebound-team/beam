import { action } from "@storybook/addon-actions";
import { useState } from "react";
import { Button } from "src/components/Button";
import { InternalUser } from "src/components/Filters/testDomain";
import { ModalBody, ModalFooter } from "src/components/Modal/Modal";
import { useModal } from "src/components/Modal/useModal";
import { GridColumn, GridDataRow, GridTable, simpleHeader, SimpleHeaderAndDataOf } from "src/components/Table";
import { Css } from "src/Css";
import { TextField } from "src/inputs";

/** A fake modal content component that we share across the modal and superdrawer stories. */
export function TestModalContent(props: { initNumSentences?: number; showLeftAction?: boolean }) {
  const { closeModal } = useModal();
  const { initNumSentences = 1, showLeftAction } = props;
  const [numSentences, setNumSentences] = useState(initNumSentences);
  const [primaryDisabled, setPrimaryDisabled] = useState(false);
  const [leftActionDisabled, setLeftActionDisabled] = useState(false);
  return (
    <>
      <ModalBody>
        <div css={Css.df.gap1.flexColumn.itemsStart.$}>
          <div css={Css.df.childGap1.$}>
            <Button label="More" onClick={() => setNumSentences(numSentences + 2)} />
            <Button label="Clear" onClick={() => setNumSentences(0)} />
            <Button label="Primary" onClick={() => setPrimaryDisabled(!primaryDisabled)} />
            {showLeftAction && (
              <Button label="Left Action" onClick={() => setLeftActionDisabled(!leftActionDisabled)} />
            )}
          </div>
          <p>{"The body content of the modal. This content can be anything!".repeat(numSentences)}</p>
        </div>
      </ModalBody>
      <ModalFooter xss={showLeftAction ? Css.justifyBetween.$ : undefined}>
        {showLeftAction && (
          <div>
            <Button label="Clear" onClick={action("Clear Action")} variant="tertiary" disabled={leftActionDisabled} />
          </div>
        )}
        <div css={Css.df.childGap1.$}>
          <Button label="Cancel" onClick={closeModal} variant="tertiary" />
          <Button label="Apply" onClick={action("Primary action")} disabled={primaryDisabled} />
        </div>
      </ModalFooter>
    </>
  );
}

export function TestModalFilterTable() {
  const [filter, setFilter] = useState<string>();
  const { closeModal } = useModal();
  return (
    <>
      <ModalBody>
        <TextField label="Search" value={filter} onChange={setFilter} />
        <GridTable columns={columns} rows={rows} filter={filter} xss={Css.mt1.$} />
      </ModalBody>
      <ModalFooter>
        <Button label="Cancel" onClick={closeModal} variant="tertiary" />
      </ModalFooter>
    </>
  );
}

type Row = SimpleHeaderAndDataOf<InternalUser>;

const users: InternalUser[] = [
  { id: "1", name: "Iron Man", role: "Leader" },
  { id: "2", name: "Captain America", role: "Carries the cool shield" },
  { id: "3", name: "Thor", role: "Hammer thrower" },
  { id: "4", name: "Hulk", role: "The Muscle" },
  { id: "5", name: "Black Widow", role: "Being sneaky" },
  { id: "6", name: "Ant Man", role: "Helps Wasp" },
  { id: "7", name: "Wasp", role: "Does the small jobs" },
  { id: "8", name: "Black Panther", role: "Also being sneaky" },
  { id: "9", name: "Captain Marvel", role: "Does it all" },
  { id: "10", name: "Doctor Strange", role: "Doctor" },
];
const rows: GridDataRow<Row>[] = [simpleHeader, ...users.map((u) => ({ kind: "data" as const, ...u }))];
const columns: GridColumn<Row>[] = [
  { header: () => "Name", data: ({ name }) => name },
  { header: () => "Role", data: ({ role }) => role },
];
