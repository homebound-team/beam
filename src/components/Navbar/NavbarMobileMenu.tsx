import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FocusScope, usePreventScroll } from "react-aria";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { AppNavItems } from "src/components/AppNav/AppNavItems";
import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { Button } from "src/components/Button";
import { IconButton } from "src/components/IconButton";
import { Css, Tokens } from "src/Css";
import { useEnvironmentBannerLayoutHeight } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayoutHeightContext";
import { pageContentPaddingX } from "src/layouts/layoutSpacing";
import { type MobileSubNavContent, useMobileSubNav } from "src/layouts/NavbarLayout/MobileSubNavContext";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";

type MobileNavLevel = "sub" | "global";

type NavbarMobileMenuProps = {
  items: AppNavItem[];
};

export function NavbarMobileMenu(props: NavbarMobileMenuProps) {
  const { items } = props;
  // Defaults to the `navbar` prefix so it can be tested in isolation; when embedded, Navbar forwards
  // its own `navbar` prefix (which wins), so ids are the same either way.
  const tid = useTestIds(props, "navbar");
  const [isOpen, setIsOpen] = useState(false);
  const [level, setLevel] = useState<MobileNavLevel>("sub");
  const { pathname, search } = useLocation();
  const mobileSubNav = useMobileSubNav();

  usePreventScroll({ isDisabled: !isOpen });

  const close = () => setIsOpen(false);

  // Close when navigation changes the route — covers programmatic `navigate()` and any item whose
  // handler pushes a new location. Same-route taps are handled by the drawer's anchor-click capture.
  useEffect(() => {
    close();
  }, [pathname, search]);

  return (
    <>
      <IconButton
        icon={isOpen ? "menuClose" : "menu"}
        color={Tokens.OnSurfaceMuted}
        label={isOpen ? "Close navigation" : "Open navigation"}
        onClick={() => {
          if (isOpen) {
            close();
            return;
          }
          // Reset on open so a close from the global pane doesn't swap panes mid-exit.
          setLevel("sub");
          setIsOpen(true);
        }}
        {...tid.mobileMenu}
      />
      {createPortal(
        /* AnimatePresence keeps the drawer mounted through its slide/fade-out before unmounting.*/
        <AnimatePresence>
          {isOpen && (
            <NavbarMobileDrawer
              items={items}
              mobileSubNav={mobileSubNav}
              level={level}
              onLevelChange={setLevel}
              onClose={close}
              tid={tid}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

function NavbarMobileDrawer({
  items,
  mobileSubNav,
  level,
  onLevelChange,
  onClose,
  tid,
}: {
  items: AppNavItem[];
  mobileSubNav: MobileSubNavContent | null;
  level: MobileNavLevel;
  onLevelChange: (level: MobileNavLevel) => void;
  onClose: VoidFunction;
  tid: ReturnType<typeof useTestIds>;
}) {
  // Portal renders on `document.body`; read banner height from context (CSS vars are not inherited there).
  const bannerHeightPx = useEnvironmentBannerLayoutHeight();
  const overlayTopStyle = { top: bannerHeightPx };
  const showSubLevel = mobileSubNav != null && level === "sub";

  return (
    <>
      <motion.div
        key="navbarMobileMenuScrim"
        css={Css.fixed.right0.bottom0.left0.z(zIndices.navbarMobileMenuScrim).bgColor(Tokens.Scrim).$}
        style={overlayTopStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: "linear", duration: 0.2 }}
        onClick={onClose}
        {...tid.mobileMenuScrim}
      />
      <FocusScope autoFocus contain restoreFocus>
        <motion.aside
          key="navbarMobileMenuDrawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          css={Css.fixed.bottom0.left0.df.fdc.fs0.wPx(260).oh.z(zIndices.navbarMobileMenu).bgColor(Tokens.Surface).$}
          style={overlayTopStyle}
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ ease: "linear", duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          {...tid.mobileMenuDrawer}
        >
          <div
            css={{
              ...Css.df.aic.jcsb.pyPx(12).fs0.bb.bc(Tokens.SurfaceSeparator).$,
              ...pageContentPaddingX,
            }}
          >
            <div css={Css.mw0.$}>
              {showSubLevel && (
                <Button
                  label="Main Menu"
                  icon="chevronLeft"
                  variant="quaternary"
                  size="sm"
                  onClick={() => onLevelChange("global")}
                  {...tid.mobileMenuMainMenu}
                />
              )}
            </div>
            <IconButton
              icon="x"
              color={Tokens.OnSurfaceMuted}
              label="Close navigation"
              onClick={onClose}
              {...tid.mobileMenuClose}
            />
          </div>
          <div css={Css.fg1.mh0.oh.relative.$}>
            {/* `initial={false}`: first open uses the drawer slide only; later level changes slide the panes. */}
            <AnimatePresence initial={false}>
              <motion.nav
                key={showSubLevel ? "sub" : "global"}
                css={{
                  ...Css.absolute.top0.bottom0.left0.right0.oya.df.fdc.gapPx(4).pt2.pb3.$,
                  ...pageContentPaddingX,
                }}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ ease: "linear", duration: 0.2 }}
                // String-route items render as `<a>` (react-router Link) and external URLs as `<a href>`;
                // closing on any anchor click covers same-route taps that don't change the location.
                onClickCapture={(e) => {
                  if ((e.target as Element).closest("a")) {
                    onClose();
                  }
                }}
                {...tid.mobileMenuPanel}
              >
                {showSubLevel && mobileSubNav?.top}
                <AppNavItems
                  items={showSubLevel && mobileSubNav ? mobileSubNav.items : items}
                  panelCollapsed={false}
                  {...tid}
                />
                {showSubLevel && mobileSubNav?.footer}
              </motion.nav>
            </AnimatePresence>
          </div>
        </motion.aside>
      </FocusScope>
    </>
  );
}
