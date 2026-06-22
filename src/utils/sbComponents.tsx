import { ReactNode, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppNavItems } from "src/components/AppNav/AppNavItems";
import {
  type AppNavItem,
  GridColumn,
  GridDataRow,
  GridTable,
  HomeboundLogo,
  type NavbarProps,
  type NavbarUser,
  simpleHeader,
  SimpleHeaderAndData,
  Tokens,
} from "src/index";
import { NavbarLayout, PageHeaderLayout, SideNavLayout } from "src/layouts";
import { zeroTo } from "src/utils/sb";
import { action } from "storybook/actions";

type Row = SimpleHeaderAndData<{ name: string; value: number }>;

/** Wide sticky-header `GridTable` fixture for layout and scroll stories. */
export function TableExample({
  numCols = 10,
  numRows = 100,
  virtualized = false,
}: {
  numCols?: number;
  numRows?: number;
  virtualized?: boolean;
}) {
  const rows: GridDataRow<Row>[] = useMemo(
    () => [
      simpleHeader,
      ...zeroTo(numRows).map((i) => ({
        kind: "data" as const,
        id: String(i),
        data: { name: `ccc ${i}`, value: i + 1 },
      })),
    ],
    [numRows],
  );
  const columns: GridColumn<Row>[] = useMemo(
    () =>
      zeroTo(numCols).map((i) => ({
        header: `Header ${i + 1}`,
        data: ({ value }) => `Cell ${i + 1}x${value}`,
        w: "100px",
        sticky: i === 0 ? "left" : undefined,
      })),
    [numCols],
  );

  return (
    <GridTable
      as={virtualized ? "virtual" : "div"}
      stickyHeader
      columns={columns}
      rows={rows}
      style={{ rowHeight: "fixed" }}
    />
  );
}

export function TestProjectLayout({ pageTitle, children }: { pageTitle?: string; children: ReactNode }) {
  return (
    <NavbarLayout navbar={createNavbar()}>
      <SideNavLayout sideNav={{ items: sideNavItems() }}>
        <PageHeaderLayout pageHeader={{ title: pageTitle ?? "" }}>{children}</PageHeaderLayout>
      </SideNavLayout>
    </NavbarLayout>
  );
}

export function createNavbar(): NavbarProps {
  return {
    brand: (
      <Link to="/">
        <HomeboundLogo fill={Tokens.OnSurface} width={5} />
      </Link>
    ),
    items: [
      { label: "Dashboard", onClick: "/", active: true },
      { label: "Projects", onClick: "/projects" },
      { label: "Finances", onClick: "/finances" },
      { label: "Warranty", onClick: "/warranty" },
    ],
    rightSlot: (
      <AppNavItems
        variant="global"
        items={[
          { label: "Help", onClick: "/help", icon: "helpCircle", iconOnly: true },
          { label: "Notifications", onClick: "/notifications", icon: "bell", iconOnly: true },
        ]}
      />
    ),
    user: createUser(),
  };
}

export function sideNavItems(): AppNavItem[] {
  return [
    {
      section: true,
      label: "Main",
      items: [
        { label: "Dashboard", icon: "kanban", onClick: "/", active: true },
        { label: "Schedule", icon: "calendar", onClick: "/schedule" },
        { label: "Commitments", icon: "fileBlank", onClick: "/commitments" },
        { label: "Documents", icon: "comment", onClick: "/documents" },
        { label: "Settings", icon: "pencil", onClick: "/settings" },
      ],
    },
  ];
}

function createUser(): NavbarUser {
  return {
    name: "Tony Stark",
    picture: "tony-stark.jpg",
    menuItems: [{ label: "Profile", onClick: action("Profile clicked") }],
    persistentItems: [{ label: "Sign out", onClick: action("Sign out clicked") }],
  };
}
