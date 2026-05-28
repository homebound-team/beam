import { NavLink } from "src/components/NavLinks/NavLink";
import { render, withRouter } from "src/utils/rtl";

describe("NavLink", () => {
  it("renders external links", async () => {
    const r = await render(
      <NavLink onClick="http://www.homebound.com" label="Link" variant="global" data-testid="link" />,
    );
    expect(r.link).toHaveAttribute("target", "_blank");
    expect(r.link).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("renders relative links", async () => {
    const r = await render(
      <NavLink onClick="/projects" label="Link" variant="global" data-testid="link" />,
      withRouter(),
    );
    expect(r.link).not.toHaveAttribute("target");
    expect(r.link).not.toHaveAttribute("rel");
  });

  it("can render jsx for a label", async () => {
    const r = await render(
      <NavLink onClick="/projects" label={<div>Navlink button</div>} variant="global" data-testid="link" />,
      withRouter(),
    );
    expect(r.link).toHaveTextContent("Navlink button");
  });

  it("keeps an accessible name when iconOnly", async () => {
    const r = await render(
      <NavLink onClick="/projects" label="Settings" icon="pencil" iconOnly variant="side" data-testid="link" />,
      withRouter(),
    );

    expect(r.getByRole("link", { name: "Settings" })).toBe(r.link);
  });
});
