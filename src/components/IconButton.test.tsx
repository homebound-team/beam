import { render } from "@homebound/rtl-utils";
import { IconButton } from "src/components/IconButton";
import { useTestIds } from "src/utils/useTestIds";

describe("IconButton", () => {
  it("can have a data-testid", async () => {
    const r = await render(<IconButton icon="trash" data-testid="remove" />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("remove");
  });

  it("defaults data-testid to the icon", async () => {
    const r = await render(<IconButton icon="trash" />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("trash");
  });

  it("can accept prefixed test ids", async () => {
    const testIds = useTestIds({}, "page1");
    const r = await render(<IconButton icon="trash" {...testIds.remove} />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("page1_remove");
  });
});
