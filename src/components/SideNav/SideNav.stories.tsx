import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { Avatar } from "src/components/Avatar";
import { Icon } from "src/components/Icon";
import { PreventBrowserScroll } from "src/components/Layout/PreventBrowserScroll";
import { SideNav } from "src/components/SideNav/SideNav";
import { Css, Tokens } from "src/Css";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { useSideNavLayoutContext } from "src/layouts/SideNavLayout/SideNavLayoutContext";
import { withBeamDecorator, withDimensions, withRouter, zeroTo } from "src/utils/sb";

export default {
  component: SideNav,
  decorators: [withBeamDecorator, withDimensions(), withRouter()],
  parameters: { layout: "fullscreen" },
} as Meta;

const items: AppNavItem[] = [
  { label: "Dashboard", icon: "kanban", onClick: "/", active: true },
  { label: "Projects", icon: "search", onClick: "/projects" },
  { label: "Documents", icon: "comment", onClick: "/docs" },
];

const groupedItems: AppNavItem[] = [
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
    <Shell>
      <SideNavLayout sideNav={<SideNav top={<Brand />} items={items} footer={<Footer />} />}>
        <PageContent />
      </SideNavLayout>
    </Shell>
  );
}

export function GroupedItems() {
  return (
    <Shell>
      <SideNavLayout sideNav={<SideNav top={<Brand />} items={groupedItems} footer={<Footer />} />}>
        <PageContent />
      </SideNavLayout>
    </Shell>
  );
}

const collapsibleItems: AppNavItem[] = [
  { label: "Dashboard", onClick: "/" },
  { label: "Schedule", onClick: "/schedule" },
  {
    label: "Budgets",
    items: [
      { label: "Metrics", onClick: "/budgets/metrics" },
      { label: "Budget", onClick: "/budgets/budget", active: true },
      { label: "POs", onClick: "/budgets/pos" },
      { label: "Change Events", onClick: "/budgets/change-events" },
      { label: "Expenses", onClick: "/budgets/expenses" },
      { label: "Estimates", onClick: "/budgets/estimates" },
      { label: "Client Contracts", onClick: "/budgets/client-contracts" },
      { label: "Client Invoices", onClick: "/budgets/client-invoices" },
    ],
  },
  { label: "Scope", onClick: "/scope" },
  { label: "Lot Summary", onClick: "/lot-summary" },
  { label: "Documents", onClick: "/documents" },
  {
    label: "Homeowner",
    items: [
      { label: "Profile", onClick: "/homeowner/profile" },
      { label: "Communications", onClick: "/homeowner/communications" },
    ],
  },
];

export function CollapsibleGroups() {
  return (
    <Shell>
      <SideNavLayout sideNav={<SideNav top={<Brand />} items={collapsibleItems} footer={<Footer />} />}>
        <PageContent />
      </SideNavLayout>
    </Shell>
  );
}

export function CollapsibleGroupsContrast() {
  return (
    <Shell>
      <SideNavLayout contrastRail sideNav={<SideNav top={<Brand />} items={collapsibleItems} footer={<Footer />} />}>
        <PageContent />
      </SideNavLayout>
    </Shell>
  );
}

export function WithoutTop() {
  return (
    <Shell>
      <SideNavLayout sideNav={<SideNav items={items} footer={<Footer />} />}>
        <PageContent />
      </SideNavLayout>
    </Shell>
  );
}

export function WithoutFooter() {
  return (
    <Shell>
      <SideNavLayout sideNav={<SideNav top={<Brand />} items={items} />}>
        <PageContent />
      </SideNavLayout>
    </Shell>
  );
}

export function ContrastNav() {
  // The layout owns the rail chrome (bg / border / toggle), so the ContrastScope must wrap the
  // rail itself, not just the sideNav content. SideNavLayout's `contrastRail` prop does that
  // internally — chrome + content all resolve under contrast tokens.
  return (
    <Shell>
      <SideNavLayout contrastRail sideNav={<SideNav top={<Brand />} items={groupedItems} footer={<Footer />} />}>
        <PageContent />
      </SideNavLayout>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <PreventBrowserScroll>
      <div css={Css.df.oh.h100.$}>{children}</div>
    </PreventBrowserScroll>
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

function Footer() {
  const { navState } = useSideNavLayoutContext();
  return (
    <div css={Css.df.aic.gap2.$}>
      <Avatar src={undefined} name="Jane Smith" size="sm" />
      {navState !== "collapse" && (
        <div>
          <div css={Css.smSb.color(Tokens.OnSurface).$}>Jane Smith</div>
          <div css={Css.xs.color(Tokens.OnSurfaceMuted).$}>Admin</div>
        </div>
      )}
    </div>
  );
}

function PageContent() {
  return (
    <>
      <h1 css={Css.xl.mb3.$}>Page Content</h1>
      {zeroTo(15).map((i) => (
        <p key={i} css={Css.mb3.$}>
          Lorem ipsum dolor sit amet. Section {i + 1}.
        </p>
      ))}
    </>
  );
}
