import { useEffect } from "react";
import { withSuperDrawer } from "src/utils";
import { render } from "src/utils/rtl";
import { useSuperDrawer } from "./SuperDrawerContext";

const SuperDrawerContent = ({
  openInDrawer: performOpenInDrawer,
  openInDrawerDetail: performOpenInDrawerNew,
  closeInDrawer: performCloseInDrawer,
  closeDrawer: performCloseDrawer,
}: {
  openInDrawer?: boolean;
  openInDrawerDetail?: boolean;
  closeInDrawer?: boolean;
  closeDrawer?: boolean;
}) => {
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
};

describe("SuperDrawer", () => {
  const consoleErrorMock = jest.fn();

  beforeEach(() => {
    console.error = consoleErrorMock;
  });

  it("should allow `new` element to be added", async () => {
    const { superDrawerContent } = await render(<SuperDrawerContent openInDrawer />, withSuperDrawer);
    expect(superDrawerContent()).toBeTruthy();
  });

  it("should not allow `detail` element to be added", async () => {
    const { queryByTestId } = await render(<SuperDrawerContent openInDrawerDetail />, withSuperDrawer);
    expect(queryByTestId("superDrawerContent")).toBeFalsy();
    expect(queryByTestId("superDrawerDetailContent")).toBeFalsy();
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
  });

  it("should allow `detail` element to be added when as least one `new` element is present", async () => {
    const { superDrawerDetailContent } = await render(
      <SuperDrawerContent openInDrawer openInDrawerDetail />,
      withSuperDrawer,
    );
    expect(superDrawerDetailContent()).toBeTruthy();
  });

  it("should default `detail` element title to previous elements title", async () => {
    const { superDrawer_title } = await render(<SuperDrawerContent openInDrawer openInDrawerDetail />, withSuperDrawer);
    expect(superDrawer_title()).toHaveTextContent("title");
  });

  it("should show `new` element after calling `closeInDrawer()`", async () => {
    const { superDrawerContent } = await render(
      <SuperDrawerContent openInDrawer openInDrawerDetail closeInDrawer />,
      withSuperDrawer,
    );
    expect(superDrawerContent()).toBeTruthy();
  });

  it("should reset state when calling `closeDrawer()`", async () => {
    const { queryByTestId } = await render(
      <SuperDrawerContent openInDrawer openInDrawerDetail closeDrawer />,
      withSuperDrawer,
    );
    expect(queryByTestId("superDrawer")).toBeFalsy();
  });
});
