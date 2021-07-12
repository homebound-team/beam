import { useEffect } from "react";
import { render } from "src/utils/rtl";
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
