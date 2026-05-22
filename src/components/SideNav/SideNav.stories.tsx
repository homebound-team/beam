import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { Avatar } from "src/components/Avatar";
import { Icon } from "src/components/Icon";
import { PreventBrowserScroll } from "src/components/Layout/PreventBrowserScroll";
import { SideNav, SideNavItem } from "src/components/SideNav/SideNav";
import { Css, Tokens } from "src/Css";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { useSideNavLayoutContext } from "src/layouts/SideNavLayout/SideNavLayoutContext";
import { withBeamDecorator, withDimensions, withRouter, zeroTo } from "src/utils/sb";

export default {
  component: SideNav,
  decorators: [withBeamDecorator, withDimensions(), withRouter()],
  parameters: { layout: "fullscreen" },
} as Meta;

const items: SideNavItem[] = [
  { label: "Dashboard", icon: "kanban", href: "/", active: true },
  { label: "Projects", icon: "search", href: "/projects" },
  { label: "Documents", icon: "comment", href: "/docs" },
];

const groupedItems: SideNavItem[] = [
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

const collapsibleItems: SideNavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Schedule", href: "/schedule" },
  {
    label: "Budgets",
    links: [
      { label: "Metrics", href: "/budgets/metrics" },
      { label: "Budget", href: "/budgets/budget", active: true },
      { label: "POs", href: "/budgets/pos" },
      { label: "Change Events", href: "/budgets/change-events" },
      { label: "Expenses", href: "/budgets/expenses" },
      { label: "Estimates", href: "/budgets/estimates" },
      { label: "Client Contracts", href: "/budgets/client-contracts" },
      { label: "Client Invoices", href: "/budgets/client-invoices" },
    ],
  },
  { label: "Scope", href: "/scope" },
  { label: "Lot Summary", href: "/lot-summary" },
  { label: "Documents", href: "/documents" },
  {
    label: "Homeowner",
    links: [
      { label: "Profile", href: "/homeowner/profile" },
      { label: "Communications", href: "/homeowner/communications" },
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
