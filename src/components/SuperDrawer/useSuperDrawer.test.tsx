import { act, renderHook } from "@testing-library/react-hooks";
import { ReactElement, useContext, useEffect } from "react";
import { render, withBeamRTL } from "src/utils/rtl";
import { BeamContext } from "../BeamContext";
import { useSuperDrawer } from "./index";

describe("useSuperDrawer", () => {
  it("should allow `new` element to be added", async () => {
    const { superDrawerContent } = await render(<TestDrawerContent openInDrawer />);
    expect(superDrawerContent()).toBeTruthy();
  });

  it("should not allow `detail` element to be added", async () => {
    await expect(render(<TestDrawerContent openDrawerDetail />)).rejects.toThrow(
      "openInDrawer was not called before openDrawerDetail",
    );
  });

  it("should allow `detail` element to be added when as least one `new` element is present", async () => {
    const { superDrawerDetailContent } = await render(<TestDrawerContent openInDrawer openDrawerDetail />);
    expect(superDrawerDetailContent()).toBeTruthy();
  });

  it("should default `detail` element title to previous elements title", async () => {
    const { superDrawer_title } = await render(<TestDrawerContent openInDrawer openDrawerDetail />);
    expect(superDrawer_title()).toHaveTextContent("title");
  });

  it("should show `new` element after calling `closeDrawerDetail()`", async () => {
    const { superDrawerContent } = await render(<TestDrawerContent openInDrawer openDrawerDetail closeDrawerDetail />);
    expect(superDrawerContent()).toBeTruthy();
  });

  it("should reset state when calling `closeDrawer()`", async () => {
    const { queryByTestId } = await render(<TestDrawerContent openInDrawer openDrawerDetail closeDrawer />);
    expect(queryByTestId("superDrawer")).toBeFalsy();
  });

  const wrapper = ({ children }: { children: ReactElement }) => withBeamRTL.wrap(children);

  it("should add canCloseDrawerCheck when SuperDrawer is opened", () => {
    const canCloseDrawerCheck = jest.fn(() => true);

    // Given the useSuperDrawer hook
    const hook = renderHook(useSuperDrawer, { wrapper }).result.current;
    // And a opened SuperDrawer
    act(() => hook.openInDrawer({ title: "title", content: "content" }));

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
    const beamHook = renderHook(() => useContext(BeamContext), { wrapper }).result.current;

    // When adding a canCloseDrawerCheck
    act(() => superDrawerHook.addCanCloseDrawerCheck(() => true));

    // Then expect no canCloseDrawerCheck to be added
    expect(beamHook.drawerCanCloseChecks.current).toHaveLength(0);
  });

  it("should add canCloseDrawerCheckDetail when SuperDrawer details is opened", () => {
    const canCloseDrawerDetailCheck = jest.fn(() => true);

    // Given the useSuperDrawer hook
    const hook = renderHook(useSuperDrawer, { wrapper }).result.current;
    // And a opened SuperDrawer with a detail content
    act(() => {
      hook.openInDrawer({ title: "title", content: "content" });
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
    const superDrawerHook = renderHook(useSuperDrawer, { wrapper }).result.current;
    const beamHook = renderHook(() => useContext(BeamContext), { wrapper }).result.current;
    // And a opened SuperDrawer with no detail content
    act(() => {
      superDrawerHook.openInDrawer({ title: "title", content: "content" });
    });

    // When adding a canCloseDrawerDetailCheck
    act(() => superDrawerHook.addCanCloseDrawerDetailCheck(() => true));

    // Then expect the canCloseDrawerDetailChecks to be empty
    expect(beamHook.drawerCanCloseDetailsChecks.current).toHaveLength(0);
  });

  it("should show ConfirmCloseModal when a canCloseDrawerCheck fails", async () => {
    // Given a useSuperDrawer and BeamContext hook
    const hook = renderHook(useSuperDrawer, { wrapper }).result.current;
    // And a opened SuperDrawer
    act(() => hook.openInDrawer({ title: "title", content: "content" }));

    // When adding a failing canCloseDrawerCheck
    act(() => hook.addCanCloseDrawerCheck(() => false));

    // Then expect the drawer to not close.
    expect(hook.closeDrawer()).toBeFalsy();
  });

  it("should show ConfirmCloseModal when a canCloseDrawerDetailCheck fails", async () => {
    // Given a useSuperDrawer and BeamContext hook
    const hook = renderHook(useSuperDrawer, { wrapper }).result.current;
    // And a opened SuperDrawer
    act(() => {
      hook.openInDrawer({ title: "title", content: "content" });
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
    const hook = renderHook(useSuperDrawer, { wrapper }).result.current;

    // When the drawer is opened and closed
    act(() => hook.openInDrawer({ title: "title", content: "content", onClose }));
    act(() => {
      hook.closeDrawer();
    });

    // Then we called the callback
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

function TestDrawerContent(props: {
  openInDrawer?: boolean;
  openDrawerDetail?: boolean;
  closeDrawerDetail?: boolean;
  closeDrawer?: boolean;
}) {
  const context = useSuperDrawer();
  useEffect(() => {
    if (props.openInDrawer) {
      context.openInDrawer({
        title: "title",
        content: <h2 data-testid="superDrawerContent">SuperDrawer Content</h2>,
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
  }, []);
  return <h1>Page Content</h1>;
}
