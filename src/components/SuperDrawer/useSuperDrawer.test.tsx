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

  it("should not allow `detail` element to be added", async () => {
    await expect(render(<TestDrawerContent openDrawerDetail />)).rejects.toThrow(
      "openInDrawer was not called before openDrawerDetail",
    );
  });

  it("should allow `detail` element to be added when as least one `new` element is present", async () => {
    const r = await render(<TestDrawerContent openInDrawer openDrawerDetail />);
    expect(r.superDrawerDetailContent).toBeTruthy();
  });

  it("should show `new` element after calling `closeDrawerDetail()`", async () => {
    const r = await render(<TestDrawerContent openInDrawer openDrawerDetail closeDrawerDetail />);
    expect(r.superDrawerContent).toBeTruthy();
  });

  it("should reset state when calling `closeDrawer()`", async () => {
    const r = await render(<TestDrawerContent openInDrawer openDrawerDetail closeDrawer />);
    expect(r.queryByTestId("superDrawer")).toBeFalsy();
  });

  const wrapper = ({ children }: { children: ReactElement }) => withBeamRTL.wrap(children);

  it("should add canCloseDrawerCheck when SuperDrawer is opened", () => {
    const canCloseDrawerCheck = jest.fn(() => true);

    // Given the useSuperDrawer hook
    const hook = renderHook(useSuperDrawer, { wrapper: wrapper as any }).result.current;
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
    const superDrawerHook = renderHook(useSuperDrawer, { wrapper: wrapper as any }).result.current;
    const beamHook = renderHook(() => useBeamContext(), { wrapper: wrapper as any }).result.current;

    // When adding a canCloseDrawerCheck
    act(() => superDrawerHook.addCanCloseDrawerCheck(() => true));

    // Then expect no canCloseDrawerCheck to be added
    expect(beamHook.drawerCanCloseChecks.current).toHaveLength(0);
  });

  it("should add canCloseDrawerCheckDetail when SuperDrawer details is opened", () => {
    const canCloseDrawerDetailCheck = jest.fn(() => true);

    // Given the useSuperDrawer hook
    const hook = renderHook(useSuperDrawer, { wrapper: wrapper as any }).result.current;
    // And a opened SuperDrawer with a detail content
    act(() => {
      hook.openInDrawer({ content: "content" });
      hook.openDrawerDetail({ content: "detail content" });
    });

    // When adding a canCloseDrawerDetailCheck
    act(() => hook.addCanCloseDrawerDetailCheck(canCloseDrawerDetailCheck));

    // Then expect the canCloseDrawerDetail check to be called when closing the drawer
    act(() => {
      hook.closeDrawer();
    });
    expect(canCloseDrawerDetailCheck).toHaveBeenCalledTimes(1);
  });

  it("should not add canCloseDrawerCheckDetail when SuperDrawer details is closed", () => {
    // Given the useSuperDrawer and beamContent hook
    const superDrawerHook = renderHook(useSuperDrawer, { wrapper: wrapper as any }).result.current;
    const beamHook = renderHook(() => useBeamContext(), { wrapper: wrapper as any }).result.current;
    // And a opened SuperDrawer with no detail content
    act(() => {
      superDrawerHook.openInDrawer({ content: "content" });
    });

    // When adding a canCloseDrawerDetailCheck
    act(() => superDrawerHook.addCanCloseDrawerDetailCheck(() => true));

    // Then expect the canCloseDrawerDetailChecks to be empty
    expect(beamHook.drawerCanCloseDetailsChecks.current).toHaveLength(0);
  });

  it("should show ConfirmCloseModal when a canCloseDrawerCheck fails", async () => {
    // Given a useSuperDrawer and BeamContext hook
    const hook = renderHook(useSuperDrawer, { wrapper: wrapper as any }).result.current;
    // And a opened SuperDrawer
    act(() => hook.openInDrawer({ content: "content" }));

    // When adding a failing canCloseDrawerCheck
    act(() => hook.addCanCloseDrawerCheck(() => false));

    // Then expect the drawer to not close.
    expect(await act(() => hook.closeDrawer())).toBeFalsy();
  });

  it("should show ConfirmCloseModal when a canCloseDrawerDetailCheck fails", async () => {
    // Given a useSuperDrawer and BeamContext hook
    const hook = renderHook(useSuperDrawer, { wrapper: wrapper as any }).result.current;
    // And a opened SuperDrawer
    act(() => {
      hook.openInDrawer({ content: "content" });
      hook.openDrawerDetail({ content: "drawer detail" });
    });

    // When adding a failing canCloseDrawerCheck
    act(() => hook.addCanCloseDrawerDetailCheck(() => false));

    // Then expect the drawer to not close.
    expect(hook.closeDrawer()).toBeFalsy();
  });

  it("calls onClose when closed", () => {
    const onClose = jest.fn();

    // Given the useSuperDrawer hook
    const hook = renderHook(useSuperDrawer, { wrapper: wrapper as any }).result.current;

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
    const hook = renderHook(useSuperDrawer, { wrapper: wrapper as any }).result.current;
    // And a closed SuperDrawer
    // When we call onClose
    // Then we do not expect to have an error thrown
    act(() => {
      expect(hook.closeDrawer).not.toThrow();
    });
  });
});

function TestDrawerContent(props: {
  openInDrawer?: boolean;
  openDrawerDetail?: boolean;
  closeDrawerDetail?: boolean;
  closeDrawer?: boolean;
}) {
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
      if (props.openDrawerDetail) {
        context.openDrawerDetail({
          content: <h2 data-testid="superDrawerDetailContent">SuperDrawer Content</h2>,
        });
      }
      if (props.closeDrawerDetail) {
        context.closeDrawerDetail();
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
