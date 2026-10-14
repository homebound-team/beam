import { waitFor } from "@homebound/rtl-utils";
import { useState } from "react";
import { AiSlimBanner } from "src/components/AiSlimBanner";
import { Button } from "src/components/Button";
import { DocumentScrollLayoutProvider } from "src/layouts/DocumentScrollLayoutContext";
import { setViewport } from "src/tests/viewport";
import { click, clickAndWait, render } from "src/utils/rtl";
import { DocumentScrollOverlayRightPaneLayout } from "./DocumentScrollOverlayRightPaneLayout";
import { RightPaneBanner, RightPanePanel } from "./RightPanePanel";
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

  it.each([
    ["context", { icon: "wrench", text: "Labor" }],
    ["status", { kind: "status", text: "Draft", type: "warning" }],
  ] as const)("renders a %s tag", async (_, tag) => {
    // Given a tag
    // When rendered
    const r = await render(
      <RightPanePanel title="Install Doors & Trim" tag={tag}>
        Hello
      </RightPanePanel>,
    );
    // Then it renders with the panel's tag test id
    expect(r.rightPanePanel_tag).toHaveTextContent(tag.text);
  });

  it("shows a banner from the panel's children under the header until the caller drops it", async () => {
    // Given a panel whose body renders a banner while there are suggestions
    // When rendered
    const r = await render(<SuggestionsPanel />);
    // Then the banner sits under the header, outside the scrolling body
    expect(r.rightPanePanel_banner).toHaveTextContent("Review 6 Suggested Changes");
    expect(r.rightPanePanel_body.contains(r.aiSlimBanner)).toBe(false);

    // When the suggestions are ignored
    click(r.ignoreAll);

    // Then the banner goes away while the panel stays open
    expect(r.rightPanePanel_banner).toBeEmptyDOMElement();
    expect(r.rightPanePanel_body).toHaveTextContent("Hello");
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

function SuggestionsPanel() {
  const [hasSuggestions, setHasSuggestions] = useState(true);
  return (
    <RightPanePanel title="Install Doors & Trim">
      {hasSuggestions && (
        <RightPaneBanner>
          <AiSlimBanner
            title="Review 6 Suggested Changes"
            action={{ label: "Ignore All", onClick: () => setHasSuggestions(false) }}
          />
        </RightPaneBanner>
      )}
      Hello
    </RightPanePanel>
  );
}
