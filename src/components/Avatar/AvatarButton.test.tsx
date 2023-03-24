import { AvatarButton } from "src/components/Avatar/AvatarButton";
import { click, render } from "src/utils/rtl";

describe(AvatarButton, () => {
  it("fires onClick callback", async () => {
    const onClick = jest.fn();
    const r = await render(<AvatarButton src="test" name="Test" onClick={onClick} />);
    click(r.test_button);
    expect(onClick).toBeCalledTimes(1);
  });

  it("disables button", async () => {
    const onClick = jest.fn();
    const r = await render(<AvatarButton src="test" name="Test" onClick={onClick} disabled />);
    expect(r.test_button()).toBeDisabled();
    click(r.test_button);
    expect(onClick).toBeCalledTimes(0);
  });

  it("can render as a relative link", async () => {
    const r = await render(<AvatarButton src="test" name="Test" onClick="/relativePath" />, {});
    expect(r.test_button().tagName).toBe("A");
    expect(r.test_button()).toHaveAttribute("href", "/relativePath");
  });

  it("can render as an absolute link", async () => {
    const r = await render(<AvatarButton src="test" name="Test" onClick="https://www.homebound.com" />);
    expect(r.test_button().tagName).toBe("A");
    expect(r.test_button())
      .toHaveAttribute("href", "https://www.homebound.com")
      .toHaveAttribute("target", "_blank")
      .toHaveAttribute("rel", "noreferrer noopener");
  });
});
