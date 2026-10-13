import { shouldDismissOverlay } from "src/components/internal/shouldDismissOverlay";

describe("shouldDismissOverlay", () => {
  it("dismisses a press that is not inside layered content", () => {
    // Given a button outside any dialog, alert, or tribute menu
    const button = document.createElement("button");
    document.body.append(button);
    // When deciding whether that press dismisses
    const dismiss = shouldDismissOverlay(button, null);
    // Then it does
    expect(dismiss).toBe(true);
    button.remove();
  });

  it("keeps the overlay open for a tribute menu or an alert", () => {
    // Given a tribute menu and an alert
    const tribute = document.createElement("div");
    tribute.className = "tribute-container";
    const tributeItem = document.createElement("button");
    tribute.append(tributeItem);
    const alert = document.createElement("div");
    alert.setAttribute("role", "alert");
    const alertItem = document.createElement("button");
    alert.append(alertItem);
    document.body.append(tribute, alert);
    // Then neither press dismisses
    expect(shouldDismissOverlay(tributeItem, null)).toBe(false);
    expect(shouldDismissOverlay(alertItem, null)).toBe(false);
    tribute.remove();
    alert.remove();
  });

  it("dismisses a press in the dialog that contains the trigger", () => {
    // Given a dialog that owns the trigger, and another dialog above it
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    const trigger = document.createElement("button");
    const inside = document.createElement("button");
    dialog.append(trigger, inside);
    const onTop = document.createElement("div");
    onTop.setAttribute("role", "dialog");
    const onTopItem = document.createElement("button");
    onTop.append(onTopItem);
    document.body.append(dialog, onTop);
    // Then the dialog we live in dismisses, and the one above does not
    expect(shouldDismissOverlay(inside, trigger)).toBe(true);
    expect(shouldDismissOverlay(onTopItem, trigger)).toBe(false);
    dialog.remove();
    onTop.remove();
  });
});
