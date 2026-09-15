import { Button } from "src/components/Button";
import { Palette } from "src/Css";
import { noop } from "src/utils/helpers";
import { click, render, wait } from "src/utils/rtl";
import { useTestIds } from "src/utils/useTestIds";
import { vi } from "vitest";

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
    const onClick = vi.fn();
    const r = await render(<Button label="Button" onClick={onClick} />);
    expect(r.button.tagName).toBe("BUTTON");
    expect(r.button).toHaveAttribute("type", "button");
    click(r.button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("can render a specific button type", async () => {
    const r = await render(<Button label="Button" type="submit" onClick={noop} />);
    expect(r.button).toHaveAttribute("type", "submit");
  });

  it("applies expected properties when rendering a link with an absolute url", async () => {
    const r = await render(<Button label="Button" onClick="https://www.homebound.com" />, {});
    expect(r.button.tagName).toBe("A");
    expect(r.button).toHaveAttribute("href", "https://www.homebound.com");
    expect(r.button).toHaveAttribute("target", "_blank");
    expect(r.button).toHaveAttribute("rel", "noreferrer noopener");
    expect(r.button).not.toHaveAttribute("download");
  });

  it("applies expected properties when rendering a link with a relative url", async () => {
    const r = await render(<Button label="Button" onClick="/testPath" />, {});
    expect(r.button.tagName).toBe("A");
    expect(r.button).toHaveAttribute("href", "/testPath");
    expect(r.button).not.toHaveAttribute("target");
    expect(r.button).not.toHaveAttribute("rel");
    expect(r.button).not.toHaveAttribute("download");
  });

  it("applies expected properties when rendering a link with a relative url to open in new tab", async () => {
    const r = await render(<Button label="Button" onClick="/testPath" openInNew />, {});
    expect(r.button.tagName).toBe("A");
    expect(r.button).toHaveAttribute("href", "/testPath");
    expect(r.button).toHaveAttribute("target", "_blank");
    expect(r.button).toHaveAttribute("rel", "noreferrer noopener");
    expect(r.button).not.toHaveAttribute("download");
  });

  it("fires onClick on a Button with a tooltip", async () => {
    const onClick = vi.fn();
    const r = await render(<Button label="With tooltip" tooltip="Some tooltip text" onClick={onClick} />);
    click(r.withTooltip);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("fires async onClick on a Button with a tooltip", async () => {
    const onClick = vi.fn();
    const r = await render(<Button label="With tooltip" tooltip="Some tooltip text" onClick={async () => onClick()} />);
    click(r.withTooltip, { allowAsync: true });
    await wait();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies expected properties when adding the 'download' prop", async () => {
    const r = await render(<Button label="Button" onClick="/testPath" download />, {});
    expect(r.button.tagName).toBe("A");
    expect(r.button).toHaveAttribute("href", "/testPath");
    expect(r.button).toHaveAttribute("download");
    expect(r.button).not.toHaveAttribute("target", "_blank");
    expect(r.button).not.toHaveAttribute("rel", "noreferrer noopener");
  });

  it("disables button while onClick is in flight and re-enables it after a successful promise", async () => {
    const r = await render(<Button label="Button" onClick={async () => new Promise((resolve) => resolve())} />);
    click(r.button, { allowAsync: true });
    expect(r.button).toBeDisabled();
    await wait();
    expect(r.button).not.toBeDisabled();
  });

  it("disables button while onClick is in flight and re-enables it after a failed promise", async () => {
    const onError = vi.fn();
    const r = await render(
      <Button
        label="Button"
        onClick={async () => new Promise((resolve, reject) => reject("Promise error")).catch(onError)}
      />,
    );

    click(r.button);
    expect(r.button).toBeDisabled();
    await wait();
    expect(r.button).not.toBeDisabled();
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
    expect(r.button).toHaveTextContent("Button");

    click(r.button, { allowAsync: true });
    expect(r.button).toBeDisabled();
    expect(r.button).toHaveTextContent("Watch The Button Fly");

    await wait();

    expect(r.button).not.toBeDisabled();
    expect(r.button).toHaveTextContent("Button");
  });

  it("applies colorScheme fill and border on secondary", async () => {
    // Given secondary buttons with each colorScheme
    // When rendered
    const r = await render(
      <>
        <Button label="Neutral" variant="secondary" colorScheme="neutral" onClick={noop} />
        <Button label="Info" variant="secondary" colorScheme="info" onClick={noop} />
        <Button label="Success" variant="secondary" colorScheme="success" onClick={noop} />
      </>,
    );

    // Then each applies its tinted fill and border pair
    expect(r.neutral).toHaveStyle({ backgroundColor: Palette.Gray100, borderColor: Palette.Gray600 });
    expect(r.info).toHaveStyle({ backgroundColor: Palette.Blue50, borderColor: Palette.Blue600 });
    expect(r.success).toHaveStyle({ backgroundColor: Palette.Green50, borderColor: Palette.Green600 });
  });

  it("ignores colorScheme when variant is not secondary", async () => {
    // Given a primary button with a colorScheme
    // When rendered
    const r = await render(<Button label="Primary" variant="primary" colorScheme="success" onClick={noop} />);

    // Then the scheme fill is not applied
    expect(r.primary).not.toHaveStyle({ backgroundColor: Palette.Green50 });
  });
});
