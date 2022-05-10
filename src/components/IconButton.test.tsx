import { IconButton } from "src/components/IconButton";
import { noop } from "src/utils";
import { click, render, withRouter } from "src/utils/rtl";
import { useTestIds } from "src/utils/useTestIds";

describe("IconButton", () => {
  it("can have a data-testid", async () => {
    const r = await render(<IconButton icon="trash" data-testid="remove" onClick={noop} />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("remove");
  });

  it("defaults data-testid to the icon", async () => {
    const r = await render(<IconButton icon="trash" onClick={noop} />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("trash");
  });

  it("can accept prefixed test ids", async () => {
    const testIds = useTestIds({}, "page1");
    const r = await render(<IconButton icon="trash" {...testIds.remove} onClick={noop} />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("page1_remove");
  });

  it("fires onClick method", async () => {
    const onClick = jest.fn();
    const r = await render(<IconButton icon="trash" onClick={onClick} />);
    expect(r.trash().tagName).toBe("BUTTON");
    click(r.trash);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies expected properties when rendering a link with an absolute url", async () => {
    const r = await render(<IconButton icon="trash" onClick="https://www.homebound.com" />, withRouter());
    expect(r.trash().tagName).toBe("A");
    expect(r.trash())
      .toHaveAttribute("href", "https://www.homebound.com")
      .toHaveAttribute("target", "_blank")
      .toHaveAttribute("rel", "noreferrer noopener");
  });

  it("applies expected properties when rendering a link with a relative url", async () => {
    const r = await render(<IconButton icon="trash" onClick="/testPath" />, withRouter());
    expect(r.trash().tagName).toBe("A");
    expect(r.trash()).toHaveAttribute("href", "/testPath").not.toHaveAttribute("target").not.toHaveAttribute("rel");
  });

  it("applies expected properties when rendering a link with a relative url to open in new tab", async () => {
    const r = await render(<IconButton icon="trash" onClick="/testPath" openInNew />, withRouter());
    expect(r.trash().tagName).toBe("A");
    expect(r.trash())
      .toHaveAttribute("href", "/testPath")
      .toHaveAttribute("target", "_blank")
      .toHaveAttribute("rel", "noreferrer noopener");
  });
});
