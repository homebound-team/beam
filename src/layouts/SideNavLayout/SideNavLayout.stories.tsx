import { Meta } from "@storybook/react-vite";
import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { Button } from "src/components/Button";
import { Icon } from "src/components/Icon";
import { Css, Tokens } from "src/Css";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { useSideNavLayoutContext } from "src/layouts/SideNavLayout/SideNavLayoutContext";
import { withBeamDecorator, withDimensions, withRouter, zeroTo } from "src/utils/sb";

export default {
  component: SideNavLayout,
  decorators: [withBeamDecorator, withDimensions(), withRouter()],
  parameters: { layout: "fullscreen" },
} as Meta;

// The layout owns the rail's width, surface, border, and collapse toggle and always renders the
// `SideNav` component from its `sideNav` props. `SideNav` reacts to collapse state via context.
const items: AppNavItem[] = [
  {
    section: true,
    label: "Main",
    items: [
      { label: "Dashboard", icon: "kanban", onClick: "/", active: true },
      { label: "Projects", icon: "search", onClick: "/projects" },
    ],
  },
  {
    section: true,
    label: "Workspace",
    items: [
      { label: "Members", icon: "comment", onClick: "/members" },
      { label: "Settings", icon: "pencil", onClick: "/settings" },
    ],
  },
];

export function Default() {
  return (
    <SideNavLayout sideNav={{ top: <Brand />, items, footer: <UserFooter /> }}>
      <PageContent />
    </SideNavLayout>
  );
}

export function ControlledNavState() {
  return (
    <SideNavLayout sideNav={{ top: <Brand />, items, footer: <UserFooter /> }}>
      <NavStateControls />
      <PageContent />
    </SideNavLayout>
  );
}

export function WithoutCollapseToggle() {
  return (
    <SideNavLayout sideNav={{ top: <Brand />, items, footer: <UserFooter /> }} showCollapseToggle={false}>
      <PageContent />
    </SideNavLayout>
  );
}

export function ContrastRail() {
  return (
    <SideNavLayout contrastRail sideNav={{ top: <Brand />, items, footer: <UserFooter /> }}>
      <PageContent />
    </SideNavLayout>
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
    <div css={Css.px3.py2.$}>
      <h1 css={Css.xl.mb3.$}>Page Content</h1>
      {zeroTo(15).map((i) => (
        <p key={i} css={Css.mb3.$}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Section {i + 1}.
        </p>
      ))}
    </div>
  );
}
