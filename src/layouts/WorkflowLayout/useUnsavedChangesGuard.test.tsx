import type { PressEvent } from "@react-types/shared";
import { act } from "@testing-library/react";
import { Button } from "src/components/Button";
import { click, clickAndWait, render, withRouter } from "src/utils/rtl";
import { UnsavedChangesNavigationModal, useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

describe("useUnsavedChangesGuard", () => {
  describe("Cancel", () => {
    it("calls onCancel immediately when isDirty is omitted", async () => {
      // Given a guard with no isDirty
      const onCancel = vi.fn();
      const r = await render(<Harness onCancel={onCancel} />, withRouter());

      // When Cancel is clicked
      click(r.cancel);

      // Then onCancel runs with no confirm modal
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(r.query.discardChanges).toBeNull();
    });

    it("calls onCancel immediately when the form is clean", async () => {
      // Given a clean form
      const onCancel = vi.fn();
      const r = await render(<Harness isDirty={() => false} onCancel={onCancel} />, withRouter());

      // When Cancel is clicked
      click(r.cancel);

      // Then onCancel runs with no confirm modal
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(r.query.discardChanges).toBeNull();
    });

    it("opens a confirm modal when dirty and calls onCancel only after Discard Changes", async () => {
      // Given a dirty form
      const onCancel = vi.fn();
      const r = await render(<Harness isDirty={() => true} onCancel={onCancel} />, withRouter());

      // When Cancel is clicked
      click(r.cancel);

      // Then the confirm modal is shown and onCancel is not called yet
      expect(r.discardChanges).toBeInTheDocument();
      expect(onCancel).not.toHaveBeenCalled();

      // When Discard Changes is clicked
      click(r.discardChanges);

      // Then onCancel is called
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("does not call onCancel when Continue Editing is chosen", async () => {
      // Given a dirty form whose Cancel confirm is open
      const onCancel = vi.fn();
      const r = await render(<Harness isDirty={() => true} onCancel={onCancel} />, withRouter());
      click(r.cancel);

      // When Continue Editing is clicked
      click(r.continueEditing);

      // Then onCancel is not called
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe("beforeunload", () => {
    it("calls preventDefault when dirty", async () => {
      // Given a dirty form
      await render(<Harness isDirty={() => true} onCancel={vi.fn()} />, withRouter());

      // When beforeunload fires
      const event = new Event("beforeunload", { cancelable: true });
      const preventDefault = vi.spyOn(event, "preventDefault");
      window.dispatchEvent(event);

      // Then the unload is cancelled
      expect(preventDefault).toHaveBeenCalledTimes(1);
    });

    it("does not call preventDefault when clean", async () => {
      // Given a clean form
      await render(<Harness isDirty={() => false} onCancel={vi.fn()} />, withRouter());

      // When beforeunload fires
      const event = new Event("beforeunload", { cancelable: true });
      const preventDefault = vi.spyOn(event, "preventDefault");
      window.dispatchEvent(event);

      // Then the unload is not cancelled
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it("does not call preventDefault when isDirty is omitted", async () => {
      // Given a guard with no isDirty
      await render(<Harness onCancel={vi.fn()} />, withRouter());

      // When beforeunload fires
      const event = new Event("beforeunload", { cancelable: true });
      const preventDefault = vi.spyOn(event, "preventDefault");
      window.dispatchEvent(event);

      // Then the unload is not cancelled
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it("stops listening after unmount", async () => {
      // Given a dirty form that then unmounts
      const r = await render(<Harness isDirty={() => true} onCancel={vi.fn()} />, withRouter());
      r.unmount();

      // When beforeunload fires
      const event = new Event("beforeunload", { cancelable: true });
      const preventDefault = vi.spyOn(event, "preventDefault");
      window.dispatchEvent(event);

      // Then nothing handles it
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it("reads the latest isDirty callback after rerender", async () => {
      // Given a form that starts clean
      const r = await render(<Harness isDirty={() => false} onCancel={vi.fn()} />, withRouter());

      // When it becomes dirty and beforeunload fires
      r.rerender(<Harness isDirty={() => true} onCancel={vi.fn()} />);
      const event = new Event("beforeunload", { cancelable: true });
      const preventDefault = vi.spyOn(event, "preventDefault");
      window.dispatchEvent(event);

      // Then the unload is cancelled using the updated callback
      expect(preventDefault).toHaveBeenCalledTimes(1);
    });
  });

  describe("React Router useBlocker", () => {
    it("allows navigation when clean", async () => {
      // Given a clean form
      const router = withRouter("/");
      const r = await render(<Harness isDirty={() => false} onCancel={vi.fn()} />, router);

      // When navigating away
      await act(async () => {
        await router.navigate("/other");
      });

      // Then navigation proceeds with no confirm modal
      expect(router.location.pathname).toBe("/other");
      expect(r.query.discardChanges).toBeNull();
    });

    it("allows navigation when isDirty is omitted", async () => {
      // Given a guard with no isDirty
      const router = withRouter("/");
      await render(<Harness onCancel={vi.fn()} />, router);

      // When navigating away
      await act(async () => {
        await router.navigate("/other");
      });

      // Then navigation proceeds
      expect(router.location.pathname).toBe("/other");
    });

    it("blocks navigation when dirty and proceeds after Discard Changes", async () => {
      // Given a dirty form
      const router = withRouter("/");
      const r = await render(<Harness isDirty={() => true} onCancel={vi.fn()} />, router);

      // When navigating away
      await act(async () => {
        await router.navigate("/other");
      });

      // Then navigation is blocked and a confirm modal appears
      expect(router.location.pathname).toBe("/");
      expect(r.discardChanges).toBeInTheDocument();

      // When Discard Changes is clicked
      await clickAndWait(r.discardChanges);

      // Then navigation proceeds
      expect(router.location.pathname).toBe("/other");
    });

    it("stays on the page when Continue Editing is chosen after a blocked navigation", async () => {
      // Given a dirty form with a blocked navigation
      const router = withRouter("/");
      const r = await render(<Harness isDirty={() => true} onCancel={vi.fn()} />, router);
      await act(async () => {
        await router.navigate("/other");
      });

      // When Continue Editing is clicked
      await clickAndWait(r.continueEditing);

      // Then we remain on the current route
      expect(router.location.pathname).toBe("/");
    });
  });
});

function Harness(props: { isDirty?: () => boolean; onCancel: (e: PressEvent) => void }) {
  const { onCancelClick, navigationBlocker } = useUnsavedChangesGuard(props);
  return (
    <>
      <Button label="Cancel" onClick={onCancelClick} />
      {navigationBlocker && <UnsavedChangesNavigationModal {...navigationBlocker} />}
    </>
  );
}
