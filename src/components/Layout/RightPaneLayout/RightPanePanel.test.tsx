import { type ObjectConfig, useFormState } from "@homebound/form-state";
import { waitFor } from "@homebound/rtl-utils";
import { useState } from "react";
import { Button } from "src/components/Button";
import { BoundTextField } from "src/forms/BoundTextField";
import { DocumentScrollLayoutProvider } from "src/layouts/DocumentScrollLayoutContext";
import { StepperLayout } from "src/layouts/Workflow/StepperLayout";
import { setViewport } from "src/tests/viewport";
import { click, clickAndWait, render, type, withRouter } from "src/utils/rtl";
import { DocumentScrollOverlayRightPaneLayout } from "./DocumentScrollOverlayRightPaneLayout";
import { RightPaneLayout } from "./RightPaneLayout";
import { RightPanePanel } from "./RightPanePanel";
import { useRightPaneActions } from "./useRightPane";

describe("RightPanePanel", () => {
  it("renders title, body, and a close control that closes the pane", async () => {
    // Given an open desktop right pane with RightPanePanel chrome
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollOverlayRightPaneLayout>
          <div>Main</div>
        </DocumentScrollOverlayRightPaneLayout>
        <OpenPanelButton />
      </DocumentScrollLayoutProvider>,
    );
    await clickAndWait(r.openPaneBtn);

    // Then title and body render; close is present and focused
    expect(r.rightPanePanel_header).toHaveTextContent("Comments");
    expect(r.rightPanePanel_body).toHaveTextContent("Hello");
    expect(r.rightPanePanel_close).toBeInTheDocument();
    expect(r.rightPanePanel_close).toHaveFocus();

    // When closing via the built-in control
    click(r.rightPanePanel_close);

    // Then the pane content clears after exit animation
    await waitFor(() => {
      expect(r.query.rightPaneContent).toBeNull();
    });
  });

  it("puts the close control in the header on sm", async () => {
    // Given a mobile viewport
    setViewport("sm");
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollOverlayRightPaneLayout>
          <div>Main</div>
        </DocumentScrollOverlayRightPaneLayout>
        <OpenPanelButton />
      </DocumentScrollLayoutProvider>,
    );

    // When the pane opens
    await clickAndWait(r.openPaneBtn);

    // Then close is in the header (not an edge control outside it)
    expect(r.rightPanePanel_close).toBeInTheDocument();
    expect(r.rightPanePanel_header.contains(r.rightPanePanel_close)).toBe(true);
  });

  it("omits the footer when it has no actions", async () => {
    const r = await render(<RightPanePanel title="Comments">Hello</RightPanePanel>);
    expect(r.query.rightPanePanel_footer).not.toBeInTheDocument();
  });

  it("pins footer actions outside the scrolling body and fires each one", async () => {
    // Given a panel with all three footer actions
    const onDelete = vi.fn();
    const onCancel = vi.fn();
    const onSave = vi.fn();
    const r = await render(
      <RightPanePanel
        title="Install Doors & Trim"
        deleteAction={{ onClick: onDelete }}
        secondaryAction={{ label: "Cancel", onClick: onCancel }}
        primaryAction={{ label: "Save", onClick: onSave }}
      >
        Hello
      </RightPanePanel>,
    );

    // Then the footer sits outside the scrolling body
    expect(r.rightPanePanel_body.contains(r.rightPanePanel_footer)).toBe(false);

    // When clicking each action
    click(r.rightPanePanel_delete);
    click(r.rightPanePanel_secondaryAction);
    click(r.rightPanePanel_primaryAction);

    // Then each handler fires
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, 1])("keeps delete icon-only for a count of %s", async (count) => {
    const r = await render(
      <RightPanePanel title="Install Doors & Trim" deleteAction={{ onClick: () => {}, count }}>
        Hello
      </RightPanePanel>,
    );
    expect(r.rightPanePanel_delete).toHaveAttribute("aria-label", "Delete");
    expect(r.rightPanePanel_delete).toHaveTextContent("");
  });

  it("labels a bulk delete with its count, exposing a single button", async () => {
    const r = await render(
      <RightPanePanel title="Bulk Edit" deleteAction={{ onClick: () => {}, count: 3 }}>
        Hello
      </RightPanePanel>,
    );
    expect(r.rightPanePanel_delete).toHaveTextContent("Delete (3)");
    // The hidden measuring copy isn't exposed as a second button
    expect(r.getAllByRole("button", { name: "Delete (3)" })).toHaveLength(1);
  });

  describe("isDirty", () => {
    it("closes a clean pane without asking", async () => {
      // Given an open pane without edits
      const r = await render(<GuardedPane />);
      await clickAndWait(r.openA);

      // When closing
      click(r.rightPanePanel_close);

      // Then it closes without asking
      expect(r.query.discardChanges).toBeNull();
      await waitFor(() => expect(r.query.rightPaneContent).toBeNull());
    });

    it.each([
      ["the X", "rightPanePanel_close"],
      ["a caller's closeRightPane", "cancel"],
    ])("asks before %s closes a dirty pane", async (_, closeTestId) => {
      // Given an open pane with unsaved edits
      const r = await render(<GuardedPane />);
      await clickAndWait(r.openA);
      type(r.notes, "edits");

      // When closing
      click(r.getByTestId(closeTestId));

      // Then it asks and stays open until the user discards
      expect(r.discardChanges).toBeInTheDocument();
      expect(r.rightPaneContent).toBeInTheDocument();
      click(r.discardChanges);
      await waitFor(() => expect(r.query.rightPaneContent).toBeNull());
    });

    it("keeps a dirty pane and its edits when the user continues editing", async () => {
      // Given an open pane with unsaved edits
      const r = await render(<GuardedPane />);
      await clickAndWait(r.openA);
      type(r.notes, "edits");

      // When closing, then choosing to continue editing
      click(r.rightPanePanel_close);
      click(r.continueEditing);

      // Then the pane stays open with its edits
      expect(r.query.discardChanges).toBeNull();
      expect(r.notes).toHaveValue("edits");
    });

    it("asks before swapping a dirty pane to content with another key", async () => {
      // Given an open pane with unsaved edits
      const r = await render(<GuardedPane />);
      await clickAndWait(r.openA);
      type(r.notes, "edits");

      // When opening other content
      click(r.openB);

      // Then it asks, and only swaps once the user discards
      expect(r.rightPanePanel_header).toHaveTextContent("A");
      click(r.discardChanges);
      expect(r.rightPanePanel_header).toHaveTextContent("B");
      expect(r.notes).toHaveValue("");
    });

    it("updates a dirty pane in place when the content keeps its type and key", async () => {
      // Given an open pane with unsaved edits
      const r = await render(<GuardedPane />);
      await clickAndWait(r.openA);
      type(r.notes, "edits");

      // When re-opening the same panel with new props, i.e. a bulk edit gaining a row
      click(r.updateA);

      // Then it doesn't ask, and the edits survive
      expect(r.query.discardChanges).toBeNull();
      expect(r.rightPanePanel_header).toHaveTextContent("A (2)");
      expect(r.notes).toHaveValue("edits");
    });

    it("closes a dirty pane without asking when the caller reverts its edits first", async () => {
      // Given an open pane with unsaved edits
      const r = await render(<GuardedPane />);
      await clickAndWait(r.openA);
      type(r.notes, "edits");

      // When deleting the shown item, which reverts and closes in one handler
      click(r.rightPanePanel_delete);

      // Then it closes without asking
      expect(r.query.discardChanges).toBeNull();
      await waitFor(() => expect(r.query.rightPaneContent).toBeNull());
    });

    it("asks before a StepperLayout step change closes a dirty pane", async () => {
      // Given a stepper whose first step has a pane with unsaved edits
      const r = await render(<GuardedStepper />, withRouter());
      await clickAndWait(r.openA);
      type(r.notes, "edits");

      // When changing steps, then choosing to continue editing
      click(r.header_stepperTabs_tab_stepTwo);
      click(r.continueEditing);

      // Then it stays on the step with its edits
      expect(r.query.stepTwoBody).toBeNull();
      expect(r.notes).toHaveValue("edits");

      // And when changing steps and discarding, the step changes and the pane closes
      click(r.header_stepperTabs_tab_stepTwo);
      click(r.discardChanges);
      expect(r.stepTwoBody).toBeInTheDocument();
      await waitFor(() => expect(r.query.rightPaneContent).toBeNull());
    });

    it.each(["documentScroll", "rightPaneLayout"] as const)(
      "closes a dirty pane without asking when its %s host unmounts",
      async (host) => {
        // Given a pane with unsaved edits
        const r = await render(<GuardedPane host={host} />);
        await clickAndWait(r.openA);
        type(r.notes, "edits");

        // When the page hosting it goes away
        await clickAndWait(r.leavePage);

        // Then it closes without asking
        expect(r.query.discardChanges).toBeNull();
        expect(r.query.rightPaneContent).toBeNull();
      },
    );
  });
});

function OpenPanelButton() {
  const { openRightPane } = useRightPaneActions();
  return (
    <Button
      data-testid="openPaneBtn"
      label="Open"
      onClick={() =>
        openRightPane({
          content: (
            <RightPanePanel title="Comments">
              <p>Hello</p>
            </RightPanePanel>
          ),
        })
      }
    />
  );
}

/** A pane host plus the buttons a caller would use to swap, update, or close its content. */
function GuardedPane(props: { host?: "documentScroll" | "rightPaneLayout" }) {
  const { host = "documentScroll" } = props;
  const { openRightPane, closeRightPane } = useRightPaneActions();
  const [showHost, setShowHost] = useState(true);
  return (
    <DocumentScrollLayoutProvider>
      {showHost &&
        (host === "documentScroll" ? (
          <DocumentScrollOverlayRightPaneLayout>
            <div>Main</div>
          </DocumentScrollOverlayRightPaneLayout>
        ) : (
          <RightPaneLayout>
            <div>Main</div>
          </RightPaneLayout>
        ))}
      <Button label="Open A" onClick={() => openRightPane({ content: <DraftPanel key="a" title="A" /> })} />
      <Button label="Update A" onClick={() => openRightPane({ content: <DraftPanel key="a" title="A (2)" /> })} />
      <Button label="Open B" onClick={() => openRightPane({ content: <DraftPanel key="b" title="B" /> })} />
      <Button label="Cancel" onClick={() => closeRightPane()} />
      <Button label="Leave Page" onClick={() => setShowHost(false)} />
    </DocumentScrollLayoutProvider>
  );
}

/** A stepper whose first step hosts the pane, like a step body with `withRightPane`. */
function GuardedStepper() {
  return (
    <StepperLayout
      title="Workflow"
      onCancel={() => {}}
      completeLabel="Save"
      onComplete={() => {}}
      steps={[
        {
          label: "Step One",
          content: (
            <DocumentScrollOverlayRightPaneLayout>
              <OpenDraftButton />
            </DocumentScrollOverlayRightPaneLayout>
          ),
        },
        { label: "Step Two", content: <div data-testid="stepTwoBody" /> },
      ]}
    />
  );
}

function OpenDraftButton() {
  const { openRightPane } = useRightPaneActions();
  return <Button label="Open A" onClick={() => openRightPane({ content: <DraftPanel key="a" title="A" /> })} />;
}

function DraftPanel(props: { title: string }) {
  const { title } = props;
  const { closeRightPane } = useRightPaneActions();
  const formState = useFormState({ config: draftConfig });
  return (
    <RightPanePanel
      title={title}
      isDirty={() => formState.dirty}
      deleteAction={{
        onClick: () => {
          formState.revertChanges();
          closeRightPane();
        },
      }}
    >
      <BoundTextField field={formState.notes} />
    </RightPanePanel>
  );
}

// A const, not a factory: form-state rebuilds the form when its config changes identity
const draftConfig: ObjectConfig<{ notes?: string | null }> = { notes: { type: "value" } };
