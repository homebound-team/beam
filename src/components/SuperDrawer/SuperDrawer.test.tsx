import { useEffect } from "react";
import { render, withSuperDrawerRTL } from "src/utils/rtl";
import { useSuperDrawer } from "./index";

describe("SuperDrawer", () => {
  const consoleErrorMock = jest.fn();

  beforeEach(() => {
    console.error = consoleErrorMock;
  });

  it("should allow `new` element to be added", async () => {
    const { superDrawerContent } = await render(<TestDrawerContent openInDrawer />, withSuperDrawerRTL);
    expect(superDrawerContent()).toBeTruthy();
  });

  it("should not allow `detail` element to be added", async () => {
    const { queryByTestId } = await render(<TestDrawerContent openInDrawerDetail />, withSuperDrawerRTL);
    expect(queryByTestId("superDrawerContent")).toBeFalsy();
    expect(queryByTestId("superDrawerDetailContent")).toBeFalsy();
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
  });

  it("should allow `detail` element to be added when as least one `new` element is present", async () => {
    const { superDrawerDetailContent } = await render(
      <TestDrawerContent openInDrawer openInDrawerDetail />,
      withSuperDrawerRTL,
    );
    expect(superDrawerDetailContent()).toBeTruthy();
  });

  it("should default `detail` element title to previous elements title", async () => {
    const { superDrawer_title } = await render(
      <TestDrawerContent openInDrawer openInDrawerDetail />,
      withSuperDrawerRTL,
    );
    expect(superDrawer_title()).toHaveTextContent("title");
  });

  it("should show `new` element after calling `closeInDrawer()`", async () => {
    const { superDrawerContent } = await render(
      <TestDrawerContent openInDrawer openInDrawerDetail closeInDrawer />,
      withSuperDrawerRTL,
    );
    expect(superDrawerContent()).toBeTruthy();
  });

  it("should reset state when calling `closeDrawer()`", async () => {
    const { queryByTestId } = await render(
      <TestDrawerContent openInDrawer openInDrawerDetail closeDrawer />,
      withSuperDrawerRTL,
    );
    expect(queryByTestId("superDrawer")).toBeFalsy();
  });
});

function TestDrawerContent(props: {
  openInDrawer?: boolean;
  openInDrawerDetail?: boolean;
  closeInDrawer?: boolean;
  closeDrawer?: boolean;
}) {
  const {
    openInDrawer: performOpenInDrawer,
    openInDrawerDetail: performOpenInDrawerNew,
    closeInDrawer: performCloseInDrawer,
    closeDrawer: performCloseDrawer,
  } = props;
  const { openInDrawer, closeInDrawer, closeDrawer } = useSuperDrawer();

  useEffect(() => {
    if (performOpenInDrawer) {
      openInDrawer({
        title: "title",
        content: <h2 data-testid="superDrawerContent">SuperDrawer Content</h2>,
      });
    }

    if (performOpenInDrawerNew) {
      openInDrawer({
        content: <h2 data-testid="superDrawerDetailContent">SuperDrawer Content</h2>,
        type: "detail",
      });
    }

    if (performCloseInDrawer) {
      closeInDrawer();
    }

    if (performCloseDrawer) {
      closeDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <h1>Page Content</h1>;
}
