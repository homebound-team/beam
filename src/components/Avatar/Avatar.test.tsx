import { Avatar } from "src/components/Avatar/Avatar";
import { render } from "src/utils/rtl";

describe(Avatar, () => {
  it("renders image", async () => {
    const src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
    const r = await render(<Avatar src={src} name="Test" />);
    expect(r.avatar()).toHaveAttribute("src", src).toHaveAttribute("alt", "Test");
  });

  it("renders fallback if undefined", async () => {
    const r = await render(<Avatar src={undefined} name="Test Name" />);
    expect(r.avatar().tagName).toBe("DIV");
    expect(r.avatar().textContent).toBe("TN");
  });

  it("renders 3 initials at most", async () => {
    const r = await render(<Avatar src={undefined} name="First Middle Last Suffix" />);
    expect(r.avatar().textContent).toBe("FML");
  });

  // Note: not testing the `onError` case as jsdom does not request external resources.
  // Instead relying on Storybook to demonstrate fallback
  // See https://github.com/jsdom/jsdom/issues/1816#issuecomment-310106280
});
