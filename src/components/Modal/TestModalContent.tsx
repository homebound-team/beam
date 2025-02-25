import { action } from "@storybook/addon-actions";
import { useState } from "react";
import { Button } from "src/components/Button";
import { InternalUser } from "src/components/Filters/testDomain";
import { ScrollableContent, ScrollableParent } from "src/components/Layout";
import { ModalBody, ModalFooter, ModalHeader } from "src/components/Modal/Modal";
import { useModal } from "src/components/Modal/useModal";
import { useSnackbar } from "src/components/Snackbar";
import { GridColumn, GridDataRow, GridTable, simpleHeader, SimpleHeaderAndData } from "src/components/Table";
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
  withTextField?: boolean;
  allowClosing?: boolean;
}

/** A fake modal content component that we share across the modal and superdrawer stories. */
export function TestModalContent(props: TestModalContentProps) {
  const { closeModal } = useModal();
  const { initNumSentences = 1, showLeftAction, withDateField } = props;
  const [numSentences, setNumSentences] = useState(initNumSentences);
  const [primaryDisabled, setPrimaryDisabled] = useState(false);
  const [leftActionDisabled, setLeftActionDisabled] = useState(false);
  const [date, setDate] = useState<Date | undefined>(jan1);
  const [internalValue, setValue] = useState<string | undefined>("");
  const { triggerNotice } = useSnackbar();

  return (
    <>
      <ModalHeader>
        {props.withTag ? (
          <div css={Css.df.aic.$}>
            <span>Modal Title with Tag</span>
            <Tag text="In progress" type="info" xss={Css.ml1.$} />
          </div>
        ) : props.withTextField ? (
          <TextField
            label="Title"
            placeholder="Test title"
            value={internalValue}
            onChange={(v) => setValue(v)}
            labelStyle="hidden"
            onEscapeBubble
            borderless
            xss={Css.xl.$}
          />
        ) : props.withTextArea ? (
          <TextAreaField
            label="Title"
            placeholder="Test title"
            value={internalValue}
            onChange={(v) => setValue(v)}
            preventNewLines
            labelStyle="hidden"
            borderless
            xss={Css.xl.$}
          />
        ) : (
          "The title of the modal that might wrap"
        )}
      </ModalHeader>
      <ModalBody>
        <div css={Css.df.gap1.fdc.aifs.$}>
          <div css={Css.df.gap1.$}>
            <Button label="More" onClick={() => setNumSentences(numSentences + 2)} />
            <Button label="Clear" onClick={() => setNumSentences(0)} />
            <Button label="Primary" onClick={() => setPrimaryDisabled(!primaryDisabled)} />
            <Button label="Trigger Snackbar" onClick={() => triggerNotice({ message: "Snackbar message" })} />
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
        <div css={Css.df.gap1.$}>
          <Button label="Cancel" onClick={closeModal} variant="tertiary" />
          <Button
            label="Apply"
            onClick={() => {
              action("Primary action");
              !props?.allowClosing && closeModal();
            }}
            disabled={primaryDisabled}
          />
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

export function VirtualizedTable() {
  const [filter, setFilter] = useState<string>();
  const { closeModal } = useModal();
  return (
    <>
      <ModalHeader>Filterable table</ModalHeader>
      {/* Define `virtualized` on ModalBody to
          (1) disable the modal's scrollbar, as it'll be introduced by the virtualized content.
          (2) adjust padding to keep the scrollbar to the far right of the screen */}
      <ModalBody virtualized>
        {/*
        Using ScrollableParent and ScrollableContent to keep TextField stuck to the top while ensuring
        GridTable's scrollbar takes up only the 100% of the scrollable content area, and not all of ModalBody's.

        However, if the only content within the ModalBody is the virtualized table, then there is no need for the
        ScrollableParent and ScrollableContent. Would be much more simple, such as:
        ```
          <ModalBody virtualized>
            <GridTable as="virtual" ... />
          </ModalBod>
        ```
        */}

        <ScrollableParent xss={Css.h100.$}>
          <TextField label="Search" value={filter} onChange={setFilter} />
          <ScrollableContent virtualized>
            <GridTable as="virtual" columns={columns} rows={rows} filter={filter} xss={Css.mt1.$} />
          </ScrollableContent>
        </ScrollableParent>
      </ModalBody>
      <ModalFooter>
        <Button label="Cancel" onClick={closeModal} variant="tertiary" />
      </ModalFooter>
    </>
  );
}

type Row = SimpleHeaderAndData<InternalUser>;

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
const rows: GridDataRow<Row>[] = [simpleHeader, ...users.map((u) => ({ kind: "data" as const, id: u.id, data: u }))];
const columns: GridColumn<Row>[] = [
  { header: () => "Name", data: ({ name }) => name },
  { header: () => "Role", data: ({ role }) => role },
];
