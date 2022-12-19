import { Button } from "src/components/Button";
import { noop } from "src/utils";
import { click, render, wait } from "src/utils/rtl";
import { useTestIds } from "src/utils/useTestIds";

describe("Button", () => {
  it("can have a data-testid", async () => {
    const r = await render(<Button label="Button" data-testid="custom" onClick={noop} />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("custom");
  });

  it("defaults data-testid to the label", async () => {
    const r = await render(<Button label="Button" onClick={noop} />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("button");
  });

  it("may render jsx for a label", async () => {
    const r = await render(<Button label={<div>Beam Button</div>} onClick={noop} />);
    expect(r.container).toHaveTextContent("Beam Button");
  });

  it("can accept prefixed test ids", async () => {
    const testIds = useTestIds({}, "page1");
    const r = await render(<Button label="Button" {...testIds.custom} onClick={noop} />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("page1_custom");
  });

  it("renders and can fires onClick", async () => {
    const onClick = jest.fn();
    const r = await render(<Button label="Button" onClick={onClick} />);
    expect(r.button().tagName).toBe("BUTTON");
    expect(r.button()).toHaveAttribute("type", "button");
    click(r.button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("can render a specific button type", async () => {
    const r = await render(<Button label="Button" type="submit" onClick={noop} />);
    expect(r.button()).toHaveAttribute("type", "submit");
  });

  it("applies expected properties when rendering a link with an absolute url", async () => {
    const r = await render(<Button label="Button" onClick="https://www.homebound.com" />, {});
    expect(r.button().tagName).toBe("A");
    expect(r.button())
      .toHaveAttribute("href", "https://www.homebound.com")
      .toHaveAttribute("target", "_blank")
      .toHaveAttribute("rel", "noreferrer noopener")
      .not.toHaveAttribute("download");
  });

  it("applies expected properties when rendering a link with a relative url", async () => {
    const r = await render(<Button label="Button" onClick="/testPath" />, {});
    expect(r.button().tagName).toBe("A");
    expect(r.button())
      .toHaveAttribute("href", "/testPath")
      .not.toHaveAttribute("target")
      .not.toHaveAttribute("rel")
      .not.toHaveAttribute("download");
  });

  it("applies expected properties when rendering a link with a relative url to open in new tab", async () => {
    const r = await render(<Button label="Button" onClick="/testPath" openInNew />, {});
    expect(r.button().tagName).toBe("A");
    expect(r.button())
      .toHaveAttribute("href", "/testPath")
      .toHaveAttribute("target", "_blank")
      .toHaveAttribute("rel", "noreferrer noopener")
      .not.toHaveAttribute("download");
  });

  it("applies expected properties when adding the 'download' prop", async () => {
    const r = await render(<Button label="Button" onClick="/testPath" download />, {});
    expect(r.button().tagName).toBe("A");
    expect(r.button())
      .toHaveAttribute("href", "/testPath")
      .toHaveAttribute("download")
      .not.toHaveAttribute("target", "_blank")
      .not.toHaveAttribute("rel", "noreferrer noopener");
  });

  it("disables button while onClick is in flight and re-enables it after a successful promise", async () => {
    const r = await render(<Button label="Button" onClick={async () => new Promise((resolve) => resolve())} />);
    click(r.button, { allowAsync: true });
    expect(r.button()).toBeDisabled();
    await wait();
    expect(r.button()).not.toBeDisabled();
  });

  it("disables button while onClick is in flight and re-enables it after a failed promise", async () => {
    const onError = jest.fn();
    const r = await render(
      <Button
        label="Button"
        onClick={async () => new Promise((resolve, reject) => reject("Promise error")).catch(onError)}
      />,
    );

    click(r.button);
    expect(r.button()).toBeDisabled();
    await wait();
    expect(r.button()).not.toBeDisabled();
    expect(onError).toBeCalledWith("Promise error");
  });

  it("changes button label if present while async onClick is in flight and reverts it after a successful promise", async () => {
    const r = await render(
      <Button
        label="Button"
        labelInFlight="Watch The Button Fly"
        onClick={async () => new Promise((resolve) => resolve())}
      />,
    );
    expect(r.button()).toHaveTextContent("Button");

    click(r.button, { allowAsync: true });
    expect(r.button()).toBeDisabled();
    expect(r.button()).toHaveTextContent("Watch The Button Fly");

    await wait();

    expect(r.button()).not.toBeDisabled();
    expect(r.button()).toHaveTextContent("Button");
  });
});
