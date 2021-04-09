import { render } from "@homebound/rtl-utils";
import { IconButton } from "src/components/IconButton";

describe("IconButton", () => {
  it("can have a data-testid", async () => {
    const r = await render(<IconButton icon="trash" data-testid="remove" />);
    expect(r.firstElement.getAttribute("data-testid")).toEqual("remove");
  });
});
