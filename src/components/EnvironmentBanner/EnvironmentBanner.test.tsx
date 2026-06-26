import {
  EnvironmentBanner,
  environmentBannerSizePx,
  shouldShowEnvironmentBanner,
} from "src/components/EnvironmentBanner/EnvironmentBanner";
import { Tokens } from "src/Css";
import { render } from "src/utils/rtl";

describe("EnvironmentBanner", () => {
  it("renders dev badge, message, and dev background", async () => {
    // Given a dev environment banner
    const r = await render(<EnvironmentBanner env="dev" />);

    // Then the badge and message render with the dev background
    expect(r.environmentBanner_badge).toHaveTextContent("DEV");
    expect(r.environmentBanner_message).toHaveTextContent("You are in the Dev Environment");
    expect(r.environmentBanner_info).toBeInTheDocument();
    expect(r.environmentBanner).toHaveStyle({
      backgroundColor: Tokens.EnvBrandDev,
      height: `${environmentBannerSizePx}px`,
    });
  });

  it("renders qa badge and message without impersonation", async () => {
    // Given a qa environment banner
    const r = await render(<EnvironmentBanner env="qa" />);

    // Then the qa banner renders without impersonation chrome
    expect(r.environmentBanner_badge).toHaveTextContent("QA");
    expect(r.environmentBanner_message).toHaveTextContent("You are in the QA Environment");
    expect(r.query.environmentBanner_impersonating).toBeNull();
    expect(r.environmentBanner).toHaveStyle({ backgroundColor: Tokens.EnvBrandQa });
  });

  it("renders qa impersonation content on the right", async () => {
    // Given a qa environment banner with impersonation
    const r = await render(<EnvironmentBanner env="qa" impersonating={{ name: "Andrea Eppy" }} />);

    // Then the impersonation row renders with the qa background
    expect(r.environmentBanner_badge).toHaveTextContent("QA");
    expect(r.environmentBanner_impersonating).toHaveTextContent("Impersonating Andrea Eppy");
    expect(r.environmentBanner_impersonatingIcon).toBeInTheDocument();
    expect(r.environmentBanner).toHaveStyle({ backgroundColor: Tokens.EnvBrandQa });
  });

  it("renders local-prod badge, message, and local-prod background", async () => {
    // Given a local-prod environment banner
    const r = await render(<EnvironmentBanner env="local-prod" />);

    // Then the local-prod banner renders with its warning copy
    expect(r.environmentBanner_badge).toHaveTextContent("LOCAL-PROD");
    expect(r.environmentBanner_message).toHaveTextContent("You are in the Local Prod Environment");
    expect(r.environmentBanner_info).toBeInTheDocument();
    expect(r.environmentBanner).toHaveStyle({
      backgroundColor: Tokens.EnvBrandLocalProd,
      height: `${environmentBannerSizePx}px`,
    });
  });

  it("renders prod impersonation in the message with icon only on the right", async () => {
    // Given a prod environment banner while impersonating
    const r = await render(<EnvironmentBanner env="prod" impersonating={{ name: "Andrea Eppy" }} />);

    // Then prod copy and styling render with impersonation in the message, not the right rail
    expect(r.environmentBanner_badge).toHaveTextContent("PROD");
    expect(r.environmentBanner_message).toHaveTextContent("You are impersonating Andrea Eppy");
    expect(r.environmentBanner_impersonatingIcon).toBeInTheDocument();
    expect(r.environmentBanner_impersonating).not.toHaveTextContent("Impersonating");
    expect(r.environmentBanner).toHaveStyle({ backgroundColor: Tokens.EnvBrandProd });
  });

  it("renders nothing for prod without impersonation", async () => {
    // Given a prod environment without impersonation
    const r = await render(<EnvironmentBanner env="prod" />);

    // Then the banner is absent
    expect(r.query.environmentBanner).toBeNull();
  });

  it("renders the prod warning banner when showProdWarning is set", async () => {
    // Given a prod environment without impersonation but with the prod warning set
    const r = await render(<EnvironmentBanner env="prod" showProdWarning />);

    // Then the prod banner renders the warning copy with the red local-prod fill
    expect(r.environmentBanner_badge).toHaveTextContent("PROD");
    expect(r.environmentBanner_message).toHaveTextContent("You are in the Production Environment");
    expect(r.query.environmentBanner_impersonating).toBeNull();
    expect(r.environmentBanner).toHaveStyle({ backgroundColor: Tokens.EnvBrandLocalProd });
  });

  it("lets the prod warning trump impersonation when both apply", async () => {
    // Given prod while impersonating and with showProdWarning set
    const r = await render(<EnvironmentBanner env="prod" impersonating={{ name: "Andrea Eppy" }} showProdWarning />);

    // Then the prod warning copy and red fill win, with impersonation still shown on the right (like local-prod)
    expect(r.environmentBanner_message).toHaveTextContent("You are in the Production Environment");
    expect(r.environmentBanner).toHaveStyle({ backgroundColor: Tokens.EnvBrandLocalProd });
    expect(r.environmentBanner_impersonating).toHaveTextContent("Impersonating Andrea Eppy");
    expect(r.environmentBanner_impersonatingIcon).toBeInTheDocument();
  });

  it("renders nothing for local", async () => {
    // Given a local environment
    const r = await render(<EnvironmentBanner env="local" />);

    // Then the banner is absent
    expect(r.query.environmentBanner).toBeNull();
  });
});

describe("shouldShowEnvironmentBanner", () => {
  it("returns true for dev, qa, and local-prod", () => {
    expect(shouldShowEnvironmentBanner("dev", undefined, false)).toBe(true);
    expect(shouldShowEnvironmentBanner("qa", undefined, false)).toBe(true);
    expect(shouldShowEnvironmentBanner("local-prod", undefined, false)).toBe(true);
  });

  it("returns true for prod when impersonating or showProdWarning is set", () => {
    expect(shouldShowEnvironmentBanner("prod", undefined, false)).toBe(false);
    expect(shouldShowEnvironmentBanner("prod", { name: "Andrea Eppy" }, false)).toBe(true);
    expect(shouldShowEnvironmentBanner("prod", undefined, true)).toBe(true);
  });

  it("returns false for local", () => {
    expect(shouldShowEnvironmentBanner("local", undefined, false)).toBe(false);
    expect(shouldShowEnvironmentBanner("local", { name: "Andrea Eppy" }, false)).toBe(false);
  });
});
