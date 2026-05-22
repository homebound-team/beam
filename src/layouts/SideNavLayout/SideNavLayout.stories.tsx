import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { Button } from "src/components/Button";
import { Icon } from "src/components/Icon";
import { PreventBrowserScroll } from "src/components/Layout/PreventBrowserScroll";
import { SideNav, SideNavItem } from "src/components/SideNav/SideNav";
import { Css, Tokens } from "src/Css";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { useSideNavLayoutContext } from "src/layouts/SideNavLayout/SideNavLayoutContext";
import { withBeamDecorator, withDimensions, withRouter, zeroTo } from "src/utils/sb";

export default {
  component: SideNavLayout,
  decorators: [withBeamDecorator, withDimensions(), withRouter()],
  parameters: { layout: "fullscreen" },
} as Meta;

// The layout owns the rail's width, surface, border, and collapse toggle, so any sideNav
// content (`SideNav` or custom JSX) inherits the rail look. Most stories pass SideNav;
// `CustomSideRail` demonstrates the "any content gets the chrome" path.
const items: SideNavItem[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", icon: "kanban", href: "/", active: true },
      { label: "Projects", icon: "search", href: "/projects" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Members", icon: "comment", href: "/members" },
      { label: "Settings", icon: "pencil", href: "/settings" },
    ],
  },
];

export function Default() {
  return (
    <Shell>
      <SideNavLayout sideNav={<SideNav top={<Brand />} items={items} footer={<UserFooter />} />}>
        <PageContent />
      </SideNavLayout>
    </Shell>
  );
}

export function WithoutTopNav() {
  return (
    <PreventBrowserScroll>
      <SideNavLayout sideNav={<SideNav top={<Brand />} items={items} footer={<UserFooter />} />}>
        <PageContent />
      </SideNavLayout>
    </PreventBrowserScroll>
  );
}

export function ControlledNavState() {
  return (
    <Shell>
      <SideNavLayout sideNav={<SideNav top={<Brand />} items={items} footer={<UserFooter />} />}>
        <NavStateControls />
        <PageContent />
      </SideNavLayout>
    </Shell>
  );
}

export function WithoutCollapseToggle() {
  return (
    <Shell>
      <SideNavLayout
        sideNav={<SideNav top={<Brand />} items={items} footer={<UserFooter />} />}
        showCollapseToggle={false}
      >
        <PageContent />
      </SideNavLayout>
    </Shell>
  );
}

export function CustomSideRail() {
  // Demonstrates the "free chrome" benefit: the layout's rail frame (Surface bg, right border,
  // width, collapse toggle) wraps any sideNav content, not just the SideNav pattern.
  return (
    <Shell>
      <SideNavLayout
        sideNav={
          <div css={Css.p2.df.fdc.gap1.$}>
            <strong css={Css.lg.mb2.$}>Custom Rail</strong>
            <div>This is plain JSX in the rail slot.</div>
            <div>It still gets width, surface, border, and the collapse toggle from the layout.</div>
          </div>
        }
      >
        <PageContent />
      </SideNavLayout>
    </Shell>
  );
}

function NavStateControls() {
  const { navState, setNavState } = useSideNavLayoutContext();
  return (
    <>
      <div css={Css.df.gap2.mb2.$}>
        <Button label="Expand" onClick={() => setNavState("expanded")} />
        <Button label="Collapse" onClick={() => setNavState("collapse")} />
        <Button label="Hide" onClick={() => setNavState("hidden")} />
      </div>
      <div css={Css.mb3.$}>
        Current state: <strong>{navState}</strong>
      </div>
    </>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <PreventBrowserScroll>
      <TestTopNav />
      <div css={Css.df.oh.h100.$}>{children}</div>
    </PreventBrowserScroll>
  );
}

function TestTopNav() {
  return <nav css={Css.hPx(48).w100.bgGray800.white.df.aic.px3.fs0.mh0.$}>Top Level Navigation</nav>;
}

function Brand() {
  const { navState } = useSideNavLayoutContext();
  if (navState === "collapse") return <></>;
  return (
    <div css={Css.df.fdc.gap1.$}>
      <div css={Css.br8.bgColor(Tokens.SurfaceSubtle).py1.px2.df.aic.gap1.color(Tokens.OnSurfaceSubtle).mr8.$}>
        <span css={Css.fs0.$}>
          <Icon icon="houseFilled" inc={3} />
        </span>
        <span css={Css.smSb.$}>Structure</span>
      </div>
      <h1 css={Css.lg.$}>1092 Beverly Way - Milam</h1>
      <p css={Css.xs.color(Tokens.OnSurfaceMuted).$}>Altadena, CA 91001</p>
    </div>
  );
}

function UserFooter() {
  const { navState } = useSideNavLayoutContext();
  if (navState === "collapse") return <Icon icon="userCircle" inc={3} />;
  return (
    <div css={Css.df.aic.gap2.$}>
      <Icon icon="userCircle" inc={3} />
      <div>
        <div css={Css.smSb.$}>Jane Smith</div>
        <div css={Css.xs.gray700.$}>Admin</div>
      </div>
    </div>
  );
}

function PageContent() {
  return (
    <>
      <h1 css={Css.xl.mb3.$}>Page Content</h1>
      {zeroTo(15).map((i) => (
        <p key={i} css={Css.mb3.$}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Section {i + 1}.
        </p>
      ))}
    </>
  );
}
