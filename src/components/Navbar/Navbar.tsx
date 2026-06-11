import { ReactNode } from "react";
import { AppNavItems } from "src/components/AppNav/AppNavItems";
import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import type { MenuItem } from "src/components/ButtonMenu";
import { ButtonMenu } from "src/components/ButtonMenu";
import { ContrastScope } from "src/components/ContrastScope";
import { NavbarMobileMenu } from "src/components/Navbar/NavbarMobileMenu";
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
  hideBrandOnMobile?: boolean;
  /** Primary nav entries — same shape as {@link SideNav} `items`. */
  items: AppNavItem[];
  /**
   * Free-form content rendered at the trailing (right) edge, before the user menu — e.g. icon-only
   * action buttons, a search field, etc. Rendered as-is in both desktop and mobile layouts; it does
   * not collapse into the mobile drawer.
   */
  rightSlot?: ReactNode;
  user?: NavbarUser;
};

export function Navbar(props: NavbarProps) {
  const { brand, hideBrandOnMobile = false, items, rightSlot, user } = props;
  const { sm } = useBreakpoint();
  const tid = useTestIds(props, "navbar");

  // Collapse to the mobile menu when the items don't fit, even above the `sm` breakpoint.
  const { containerRef, contentRef, overflows } = useContentOverflow<HTMLDivElement, HTMLDivElement>(!sm);
  const showMobile = sm || overflows;

  return (
    <ContrastScope>
      {/*  // TODO: bgGray800 is the background color of the navbar - no token added to support this yet */}
      <nav css={Css.bgGray800.fs0.df.aic.jcsb.wsnw.px1.py1.gap2.if(!showMobile).px5.$} {...tid}>
        <div css={Css.df.aic.gap3.fg1.mw0.$}>
          <div css={Css.df.aic.fs0.gap2.$}>
            {showMobile && <NavbarMobileMenu items={items} {...tid} />}
            <div css={Css.fs0.if(hideBrandOnMobile && showMobile).dn.$} {...tid.brand}>
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
          {rightSlot && (
            <div css={Css.df.aic.gap1.$} {...tid.rightSlot}>
              {rightSlot}
            </div>
          )}
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
