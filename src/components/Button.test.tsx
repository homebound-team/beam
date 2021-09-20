import { Button } from "src/components/Button";
import { click, render, withRouter } from "src/utils/rtl";
import { useTestIds } from "src/utils/useTestIds";

describe("Button", () => {
  it("can have a data-testid", async () => {
    const r = await render(<Button label="Button" data-testid="custom" />);
    expect(r.baseElement.getElementsByTagName("button")[0].getAttribute("data-testid")).toEqual("custom");
  });

  it("defaults data-testid to the label", async () => {
    const r = await render(<Button label="Button" />);
    expect(r.baseElement.getElementsByTagName("button")[0].getAttribute("data-testid")).toEqual("button");
  });

  it("can accept prefixed test ids", async () => {
    const testIds = useTestIds({}, "page1");
    const r = await render(<Button label="Button" {...testIds.custom} />);
    expect(r.baseElement.getElementsByTagName("button")[0].getAttribute("data-testid")).toEqual("page1_custom");
  });

  it("fires onClick method", async () => {
    const onClick = jest.fn();
    const r = await render(<Button label="Button" onClick={onClick} />);
    expect(r.button().tagName).toBe("BUTTON");
    click(r.button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies expected properties when rendering a link with an absolute url", async () => {
    const r = await render(<Button label="Button" onClick="https://www.homebound.com" />, withRouter());
    expect(r.button().tagName).toBe("A");
    expect(r.button())
      .toHaveAttribute("href", "https://www.homebound.com")
      .toHaveAttribute("target", "_blank")
      .toHaveAttribute("rel", "noreferrer noopener");
  });

  it("applies expected properties when rendering a link with a relative url", async () => {
    const r = await render(<Button label="Button" onClick="/testPath" />, withRouter());
    expect(r.button().tagName).toBe("A");
    expect(r.button()).toHaveAttribute("href", "/testPath").not.toHaveAttribute("target").not.toHaveAttribute("rel");
  });

  it("applies expected properties when rendering a link with a relative url to open in new tab", async () => {
    const r = await render(<Button label="Button" onClick="/testPath" openInNew />, withRouter());
    expect(r.button().tagName).toBe("A");
    expect(r.button())
      .toHaveAttribute("href", "/testPath")
      .toHaveAttribute("target", "_blank")
      .toHaveAttribute("rel", "noreferrer noopener");
  });
});
