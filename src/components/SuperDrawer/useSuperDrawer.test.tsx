import { act, renderHook } from "@testing-library/react";
import { ReactElement, useEffect } from "react";
import { SuperDrawerHeader } from "src/components/SuperDrawer/components/SuperDrawerHeader";
import { render, withBeamRTL } from "src/utils/rtl";
import { useBeamContext } from "../BeamContext";
import { useSuperDrawer } from "./index";

describe("useSuperDrawer", () => {
  it("should allow `new` element to be added", async () => {
    const r = await render(<TestDrawerContent openInDrawer />);
    expect(r.superDrawerHeader).toHaveTextContent("Title");
    expect(r.superDrawerContent).toBeTruthy();
  });

  it("should reset state when calling `closeDrawer()`", async () => {
    const r = await render(<TestDrawerContent openInDrawer closeDrawer />);
    expect(r.queryByTestId("superDrawer")).toBeFalsy();
  });

  const wrapper = ({ children }: { children: ReactElement }) => withBeamRTL.wrap(children);

  it("should add canCloseDrawerCheck when SuperDrawer is opened", () => {
    const canCloseDrawerCheck = jest.fn(() => true);

    // Given the useSuperDrawer hook
    const hook = renderHook(useSuperDrawer, { wrapper }).result.current;
    // And a opened SuperDrawer
    act(() => hook.openInDrawer({ content: "content" }));

    // When adding a canCloseDrawerCheck
    act(() => hook.addCanCloseDrawerCheck(canCloseDrawerCheck));

    // Then expect the canCloseDrawer check to be called when closing the drawer
    act(() => {
      hook.closeDrawer();
    });
    expect(canCloseDrawerCheck).toHaveBeenCalledTimes(1);
  });

  it("should not add canCloseDrawerCheck when SuperDrawer is closed", () => {
    // Given the useSuperDrawer hook
    const superDrawerHook = renderHook(useSuperDrawer, { wrapper }).result.current;
    const beamHook = renderHook(() => useBeamContext(), { wrapper }).result.current;

    // When adding a canCloseDrawerCheck
    act(() => superDrawerHook.addCanCloseDrawerCheck(() => true));

    // Then expect no canCloseDrawerCheck to be added
    expect(beamHook.drawerCanCloseChecks.current).toHaveLength(0);
  });

  it("should show ConfirmCloseModal when a canCloseDrawerCheck fails", async () => {
    // Given a useSuperDrawer and BeamContext hook
    const hook = renderHook(useSuperDrawer, { wrapper }).result.current;
    // And a opened SuperDrawer
    act(() => hook.openInDrawer({ content: "content" }));

    // When adding a failing canCloseDrawerCheck
    act(() => hook.addCanCloseDrawerCheck(() => false));

    // Then expect the drawer to not close.
    expect(await act(() => hook.closeDrawer())).toBeFalsy();
  });

  it("calls onClose when closed", () => {
    const onClose = jest.fn();

    // Given the useSuperDrawer hook
    const hook = renderHook(useSuperDrawer, { wrapper }).result.current;

    // When the drawer is opened and closed
    act(() => hook.openInDrawer({ content: "content", onClose }));
    act(() => {
      hook.closeDrawer();
    });

    // Then we called the callback
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not throw when attempting to closeDrawer with an empty content stack", () => {
    // Given a useSuperDrawer and BeamContext hook
    const hook = renderHook(useSuperDrawer, { wrapper }).result.current;
    // And a closed SuperDrawer
    // When we call onClose
    // Then we do not expect to have an error thrown
    act(() => {
      expect(hook.closeDrawer).not.toThrow();
    });
  });
});

function TestDrawerContent(props: { openInDrawer?: boolean; closeDrawer?: boolean }) {
  const context = useSuperDrawer();
  useEffect(
    () => {
      if (props.openInDrawer) {
        context.openInDrawer({
          content: (
            <>
              <SuperDrawerHeader title="Title" />
              <h2 data-testid="superDrawerContent">SuperDrawer Content</h2>
            </>
          ),
        });
      }
      if (props.closeDrawer) {
        context.closeDrawer();
      }
    },
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return <h1>Page Content</h1>;
}
