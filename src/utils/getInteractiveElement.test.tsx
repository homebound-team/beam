import { getButtonOrLink } from "src/utils/getInteractiveElement";
import { click, render } from "src/utils/rtl";

describe("getInteractiveElement", () => {
  const attrs: any = { "data-testid": "button" };
  it("can render as a button and apply onClick", async () => {
    const onClick = jest.fn();
    const r = await render(getButtonOrLink("test", onClick, attrs), {});
    expect(r.button().tagName).toBe("BUTTON");
    click(r.button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies expected properties when rendering a link with an absolute url", async () => {
    const r = await render(getButtonOrLink("test", "https://www.homebound.com", attrs), {});
    expect(r.button().tagName).toBe("A");
    expect(r.button())
      .toHaveAttribute("href", "https://www.homebound.com")
      .toHaveAttribute("target", "_blank")
      .toHaveAttribute("rel", "noreferrer noopener")
      .not.toHaveAttribute("download");
  });

  it("applies expected properties when rendering a link with a relative url", async () => {
    const r = await render(getButtonOrLink("test", "/testPath", attrs), {});
    expect(r.button().tagName).toBe("A");
    expect(r.button())
      .toHaveAttribute("href", "/testPath")
      .not.toHaveAttribute("target")
      .not.toHaveAttribute("rel")
      .not.toHaveAttribute("download");
  });

  it("applies expected properties when rendering a link with a relative url to open in new tab", async () => {
    const r = await render(getButtonOrLink("test", "/testPath", attrs, true), {});
    expect(r.button().tagName).toBe("A");
    expect(r.button())
      .toHaveAttribute("href", "/testPath")
      .toHaveAttribute("target", "_blank")
      .toHaveAttribute("rel", "noreferrer noopener")
      .not.toHaveAttribute("download");
  });

  it("applies expected properties download is true`", async () => {
    const r = await render(getButtonOrLink("test", "/testPath", attrs, false, true), {});
    expect(r.button().tagName).toBe("A");
    expect(r.button())
      .toHaveAttribute("href", "/testPath")
      .toHaveAttribute("download")
      .not.toHaveAttribute("target", "_blank")
      .not.toHaveAttribute("rel", "noreferrer noopener");
  });
});
