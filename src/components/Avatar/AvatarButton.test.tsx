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
    expect(r.test_button).toBeDisabled();
    click(r.test_button);
    expect(onClick).toBeCalledTimes(0);
  });

  it("can render as a relative link", async () => {
    const r = await render(<AvatarButton src="test" name="Test" onClick="/relativePath" />, {});
    expect(r.test_button.tagName).toBe("A");
    expect(r.test_button).toHaveAttribute("href", "/relativePath");
  });

  it("can render as an absolute link", async () => {
    const r = await render(<AvatarButton src="test" name="Test" onClick="https://www.homebound.com" />);
    expect(r.test_button.tagName).toBe("A");
    expect(r.test_button)
      .toHaveAttribute("href", "https://www.homebound.com")
      .toHaveAttribute("target", "_blank")
      .toHaveAttribute("rel", "noreferrer noopener");
  });

  it("can be interacted with when using tooltips", async () => {
    // Given an avatar button with a tooltip
    const onClick = jest.fn();
    const r = await render(<AvatarButton src="test" name="Test" onClick={onClick} />);
    // When clicking the image, expecting the event to bubble up
    click(r.test);
    // Then the click event is triggered
    expect(onClick).toBeCalledTimes(1);
  });

  it("can set the tooltip value", async () => {
    // Given a button with a tooltip and a name defined
    const r = await render(<AvatarButton src="test" name="Test" tooltip="Not the name" onClick={() => {}} />);
    // Then the tooltip is correctly displayed
    expect(r.test_button.closest("[data-testid='tooltip']")).toHaveAttribute("title", "Not the name");
    // And only one tooltip element is rendered (Avatar component does not render its own tooltip)
    expect(r.getAllByTestId("tooltip")).toHaveLength(1);
  });

  it("sets the tooltip to be the user's name if no tooltip is defined", async () => {
    // Given a button with no tooltip, but a name defined
    const r = await render(<AvatarButton src="test" name="Test" onClick={() => {}} />);
    // Then the tooltip is correctly displayed
    expect(r.test_button.closest("[data-testid='tooltip']")).toHaveAttribute("title", "Test");
  });
});
