import { NavLink } from "src/components/NavLink";
import { render, withRouter } from "src/utils/rtl";

describe("NavLink", () => {
  it("renders external links", async () => {
    const r = await render(
      <NavLink href="http://www.homebound.com" label="Link" variant="global" data-testid="link" />,
    );
    expect(r.link()).toHaveAttribute("target", "_blank").toHaveAttribute("rel", "noreferrer noopener");
  });

  it("renders relative links", async () => {
    const r = await render(<NavLink href="/projects" label="Link" variant="global" data-testid="link" />, withRouter());
    expect(r.link()).not.toHaveAttribute("target").not.toHaveAttribute("rel");
  });
});
