import { ReactNode } from "react";
import { AppNavItems } from "src/components/AppNav/AppNavItems";
import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import type { MenuItem } from "src/components/ButtonMenu";
import { ButtonMenu } from "src/components/ButtonMenu";
import { ContrastScope } from "src/components/ContrastScope";
import { NavbarMobileMenu } from "src/components/Navbar/NavbarMobileMenu";
import { isNavbarToolbarOnlyLink } from "src/components/Navbar/navbarUtils";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useContentOverflow } from "src/hooks/useContentOverflow";
import { useTestIds } from "src/utils";

export type NavbarUser = {
  name: string;
  picture?: string;
  menuItems: MenuItem[];
  persistentItems?: MenuItem[];
};

export type NavbarProps = {
  /**
   * Leading brand area (logomark, wordmark, etc.). Wrap in your own link or button when it
   * should navigate (e.g. react-router `Link`, plain `<a href>`, or `NavLink`).
   */
  brand: ReactNode;
  /** Primary nav entries — same shape as {@link SideNav} `items`. */
  items: AppNavItem[];
  /** Trailing toolbar entries (e.g. icon-only actions). Also `AppNavItem`s. */
  trailingItems?: AppNavItem[];
  user?: NavbarUser;
};

export function Navbar(props: NavbarProps) {
  const { brand, items, trailingItems = [], user } = props;
  const { sm } = useBreakpoint();
  const tid = useTestIds(props, "navbar");

  // Collapse to the mobile menu when the items don't fit, even above the `sm` breakpoint.
  const { containerRef, contentRef, overflows } = useContentOverflow(!sm);
  const showMobile = sm || overflows;

  // When we're the mobile view, then the trailing items that are displayed as icon-only will remain in the navbar
  // If there are other trailing items with labels, they'll be moved to the mobile menu.
  const trailingToolbarItems = sm ? trailingItems.filter(isNavbarToolbarOnlyLink) : trailingItems;

  return (
    <ContrastScope>
      {/*  // TODO: bgGray800 is the background color of the navbar - no token added to support this yet */}
      <nav css={Css.bgGray800.fs0.df.aic.jcsb.wsnw.px1.py1.gap2.if(!showMobile).px5.$} {...tid}>
        <div css={Css.df.aic.gap3.fg1.mw0.$}>
          <div css={Css.df.aic.fs0.gap2.$}>
            {showMobile && (
              // Above `sm`, the trailing toolbar stays visible, so only the primary items collapse
              // into the drawer; on true mobile, fold the trailing items in as well.
              <NavbarMobileMenu items={items} trailingItems={sm ? trailingItems : []} {...tid} />
            )}
            <div css={Css.fs0.$} {...tid.brand}>
              {brand}
            </div>
          </div>
          {!sm && (
            // Stays mounted while overflowing (hidden) so the items remain measurable and the bar
            // can expand again as space frees up.
            <div ref={containerRef} css={Css.df.aic.fg1.mw0.oh.if(overflows).visibility("hidden").$} {...tid.items}>
              <div ref={contentRef} css={Css.df.aic.gap2.add("width", "max-content").$}>
                <AppNavItems variant="global" items={items} {...tid} />
              </div>
            </div>
          )}
        </div>
        <div css={Css.df.aic.gap1.$}>
          <AppNavItems variant="global" items={trailingToolbarItems} {...tid} />
          {user && <NavbarUserMenu user={user} {...tid.userMenu} />}
        </div>
      </nav>
    </ContrastScope>
  );
}

function NavbarUserMenu({ user, ...tid }: { user: NavbarUser } & Record<string, unknown>) {
  return (
    <div css={Css.df.aic.fs0.ml1.$}>
      <ButtonMenu
        items={user.menuItems}
        persistentItems={user.persistentItems}
        trigger={{ src: user.picture, name: user.name, size: "sm", preventTooltip: true }}
        placement="right"
        {...tid}
      />
    </div>
  );
}
