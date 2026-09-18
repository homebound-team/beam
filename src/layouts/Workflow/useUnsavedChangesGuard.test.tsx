import type { PressEvent } from "@react-types/shared";
import { act } from "@testing-library/react";
import { Button } from "src/components/Button";
import { click, clickAndWait, render, withRouter } from "src/utils/rtl";
import {
  type AllowNavigationArgs,
  UnsavedChangesNavigationModal,
  useUnsavedChangesGuard,
} from "./useUnsavedChangesGuard";

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

    it("does not open a second confirm modal when Discard Changes navigates away while still dirty", async () => {
      // Given a dirty form whose Cancel handler starts a redirect (typical product onCancel)
      const router = withRouter("/");
      const r = await render(
        <Harness
          isDirty={() => true}
          onCancel={() => {
            void router.navigate("/other");
          }}
        />,
        router,
      );

      // When the user Cancels and confirms Discard Changes
      click(r.cancel);
      expect(r.discardChanges).toBeInTheDocument();
      await clickAndWait(r.discardChanges);

      // Then the cancel-driven navigation is not re-blocked by useBlocker
      expect(r.queryByText("Leave page?")).toBeNull();
      expect(r.query.discardChanges).toBeNull();
      expect(router.location.pathname).toBe("/other");
    });

    it("still blocks later navigations if Cancel discard does not navigate", async () => {
      // Given a dirty form whose Cancel handler does not redirect
      const router = withRouter("/");
      const r = await render(<Harness isDirty={() => true} onCancel={vi.fn()} />, router);

      // When the user Cancels and confirms Discard Changes, then later navigates away
      click(r.cancel);
      click(r.discardChanges);
      await act(async () => {
        await router.navigate("/other");
      });

      // Then that later navigation is still blocked
      expect(router.location.pathname).toBe("/");
      expect(r.getByText("Leave page?")).toBeInTheDocument();
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

  describe("allowNavigation", () => {
    it("lets an allowed navigation through while dirty", async () => {
      // Given a dirty form that allows other variants of the same listing
      const router = withRouter("/listing/mv:1");
      const r = await render(<Harness {...allowSameListing()} />, router);

      // When navigating to another variant
      await act(async () => {
        await router.navigate("/listing/mv:2");
      });

      // Then navigation proceeds with no confirm modal
      expect(router.location.pathname).toBe("/listing/mv:2");
      expect(r.query.discardChanges).toBeNull();
    });

    it("still blocks navigations it does not allow", async () => {
      // Given a dirty form that allows other variants of the same listing
      const router = withRouter("/listing/mv:1");
      const r = await render(<Harness {...allowSameListing()} />, router);

      // When navigating off the listing
      await act(async () => {
        await router.navigate("/other-listing/mv:9");
      });

      // Then navigation is blocked and a confirm modal appears
      expect(router.location.pathname).toBe("/listing/mv:1");
      expect(r.discardChanges).toBeInTheDocument();
    });

    it("is given the pending navigation", async () => {
      // Given a dirty form that allows everything
      const allowNavigation = vi.fn().mockReturnValue(true);
      const router = withRouter("/listing/mv:1");
      await render(<Harness isDirty={() => true} allowNavigation={allowNavigation} onCancel={vi.fn()} />, router);

      // When navigating
      await act(async () => {
        await router.navigate("/listing/mv:2");
      });

      // Then it saw where the user came from and is going
      expect(allowNavigation).toHaveBeenCalledWith({
        currentLocation: expect.objectContaining({ pathname: "/listing/mv:1" }),
        nextLocation: expect.objectContaining({ pathname: "/listing/mv:2" }),
        historyAction: "PUSH",
      });
    });

    it("is consulted for browser Back", async () => {
      // Given a dirty form the user reached from outside the listing
      const allowNavigation = vi.fn((args: AllowNavigationArgs) => args.nextLocation.pathname.startsWith("/listing/"));
      const router = withRouter("/other");
      const r = await render(
        <Harness isDirty={() => true} allowNavigation={allowNavigation} onCancel={vi.fn()} />,
        router,
      );
      await act(async () => {
        await router.navigate("/listing/mv:1");
      });

      // When they press Back, which leaves the listing
      await act(async () => {
        await router.memoryRouter.navigate(-1);
      });

      // Then the POP was offered to the callback, and its answer honored
      expect(allowNavigation).toHaveBeenLastCalledWith(expect.objectContaining({ historyAction: "POP" }));
      expect(router.location.pathname).toBe("/listing/mv:1");
      expect(r.discardChanges).toBeInTheDocument();
    });

    it("is not consulted when the form is clean", async () => {
      // Given a clean form whose allowNavigation would refuse everything
      const allowNavigation = vi.fn().mockReturnValue(false);
      const router = withRouter("/listing/mv:1");
      await render(<Harness isDirty={() => false} allowNavigation={allowNavigation} onCancel={vi.fn()} />, router);

      // When navigating away
      await act(async () => {
        await router.navigate("/other");
      });

      // Then a clean form never asks, and never blocks
      expect(allowNavigation).not.toHaveBeenCalled();
      expect(router.location.pathname).toBe("/other");
    });

    it("does not affect tab close", async () => {
      // Given a dirty form that allows every in-app navigation
      await render(<Harness isDirty={() => true} allowNavigation={() => true} onCancel={vi.fn()} />, withRouter());

      // When beforeunload fires
      const event = new Event("beforeunload", { cancelable: true });
      const preventDefault = vi.spyOn(event, "preventDefault");
      window.dispatchEvent(event);

      // Then the unload is still cancelled — a reload loses the form either way
      expect(preventDefault).toHaveBeenCalledTimes(1);
    });

    it("does not affect Cancel", async () => {
      // Given a dirty form that allows every in-app navigation
      const onCancel = vi.fn();
      const r = await render(
        <Harness isDirty={() => true} allowNavigation={() => true} onCancel={onCancel} />,
        withRouter(),
      );

      // When Cancel is clicked
      click(r.cancel);

      // Then it still confirms before leaving
      expect(r.discardChanges).toBeInTheDocument();
      expect(onCancel).not.toHaveBeenCalled();
    });
  });
});

/** A dirty form that keeps the user on `/listing/...`, i.e. variant swaps on the same form. */
function allowSameListing() {
  return {
    isDirty: () => true,
    allowNavigation: ({ nextLocation }: AllowNavigationArgs) => nextLocation.pathname.startsWith("/listing/"),
    onCancel: vi.fn(),
  };
}

function Harness(props: {
  isDirty?: () => boolean;
  allowNavigation?: (args: AllowNavigationArgs) => boolean;
  onCancel: (e: PressEvent) => void;
}) {
  const { onCancelClick, navigationBlocker } = useUnsavedChangesGuard(props);
  return (
    <>
      <Button label="Cancel" onClick={onCancelClick} />
      {navigationBlocker && <UnsavedChangesNavigationModal {...navigationBlocker} />}
    </>
  );
}
