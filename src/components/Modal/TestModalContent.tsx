import { action } from "@storybook/addon-actions";
import { useState } from "react";
import { Button } from "src/components/Button";
import { InternalUser } from "src/components/Filters/testDomain";
import { ModalBody, ModalFooter, ModalHeader } from "src/components/Modal/Modal";
import { useModal } from "src/components/Modal/useModal";
import { GridColumn, GridDataRow, GridTable, simpleHeader, SimpleHeaderAndDataOf } from "src/components/Table";
import { Tag } from "src/components/Tag";
import { Css } from "src/Css";
import { jan1 } from "src/forms/formStateDomain";
import { DateField, TextAreaField, TextField } from "src/inputs";

export interface TestModalContentProps {
  initNumSentences?: number;
  showLeftAction?: boolean;
  withTag?: boolean;
  withDateField?: boolean;
  withTextArea?: boolean;
}

/** A fake modal content component that we share across the modal and superdrawer stories. */
export function TestModalContent(props: TestModalContentProps) {
  const { closeModal } = useModal();
  const { initNumSentences = 1, showLeftAction, withDateField } = props;
  const [numSentences, setNumSentences] = useState(initNumSentences);
  const [primaryDisabled, setPrimaryDisabled] = useState(false);
  const [leftActionDisabled, setLeftActionDisabled] = useState(false);
  const [date, setDate] = useState(jan1);
  const [internalValue, setValue] = useState<string | undefined>("");
  console.log("withTextArea", props.withTextArea);
  return (
    <>
      <ModalHeader>
        {props.withTag ? (
          <div css={Css.df.aic.$}>
            <span>Modal Title with Tag</span>
            <Tag text="In progress" type="info" xss={Css.ml1.$} />
          </div>
        ) : props.withTextArea ? (
          <TextAreaField
            label="Title"
            placeholder="Test title"
            value={internalValue}
            onChange={(v) => setValue(v)}
            preventNewLines
            hideLabel
            borderless
            xss={Css.xl.$}
          />
        ) : (
          "The title of the modal that might wrap"
        )}
      </ModalHeader>
      <ModalBody>
        <div css={Css.df.gap1.fdc.aifs.$}>
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
        {withDateField && <DateField value={date} label="Date" onChange={setDate} />}
      </ModalBody>
      <ModalFooter xss={showLeftAction ? Css.jcsb.$ : undefined}>
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
      <ModalHeader>Filterable table</ModalHeader>
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
