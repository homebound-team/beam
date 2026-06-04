import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FocusScope } from "react-aria";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { AppNavItems } from "src/components/AppNav/AppNavItems";
import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { ContrastScope } from "src/components/ContrastScope";
import { IconButton } from "src/components/IconButton";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";

type NavbarMobileMenuProps = {
  items: AppNavItem[];
};

export function NavbarMobileMenu(props: NavbarMobileMenuProps) {
  const { items } = props;
  // Defaults to the `navbar` prefix so it can be tested in isolation; when embedded, Navbar forwards
  // its own `navbar` prefix (which wins), so ids are the same either way.
  const tid = useTestIds(props, "navbar");
  const [isOpen, setIsOpen] = useState(false);
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // Close when navigation changes the route — covers programmatic `navigate()` and any item whose
  // handler pushes a new location. Same-route taps are handled by the drawer's anchor-click capture.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, search]);

  const close = () => setIsOpen(false);

  return (
    <>
      <IconButton
        icon={isOpen ? "menuClose" : "menu"}
        color={Tokens.OnSurfaceMuted}
        label={isOpen ? "Close navigation" : "Open navigation"}
        onClick={() => setIsOpen((open) => !open)}
        {...tid.mobileMenu}
      />
      {createPortal(
        <ContrastScope>
          {/* AnimatePresence keeps the drawer mounted through its slide/fade-out before unmounting. */}
          <AnimatePresence>{isOpen && <NavbarMobileDrawer items={items} onClose={close} tid={tid} />}</AnimatePresence>
        </ContrastScope>,
        document.body,
      )}
    </>
  );
}

function NavbarMobileDrawer({
  items,
  onClose,
  tid,
}: {
  items: AppNavItem[];
  onClose: VoidFunction;
  tid: ReturnType<typeof useTestIds>;
}) {
  return (
    <>
      <motion.div
        key="navbarMobileMenuScrim"
        css={
          Css.fixed.top0.right0.bottom0.left0.z(zIndices.modalUnderlay).add("backgroundColor", "rgba(36,36,36,0.2)").$
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: "linear", duration: 0.2 }}
        onClick={onClose}
        {...tid.mobileMenuScrim}
      />
      <FocusScope contain restoreFocus>
        <motion.aside
          key="navbarMobileMenuDrawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          css={Css.fixed.top0.bottom0.left0.df.fdc.fs0.w100.oh.z(zIndices.sideNav).bgColor(Tokens.Surface).$}
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ ease: "linear", duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          {...tid.mobileMenuDrawer}
        >
          <div css={Css.df.aic.jcfe.p2.fs0.$}>
            <IconButton
              icon="menuClose"
              color={Tokens.OnSurfaceMuted}
              label="Close navigation"
              onClick={onClose}
              {...tid.mobileMenuClose}
            />
          </div>
          <nav
            css={Css.fg1.oya.px2.pb3.df.fdc.gap1.$}
            // String-route items render as `<a>` (react-router Link) and external URLs as `<a href>`;
            // closing on any anchor click covers same-route taps that don't change the location.
            onClickCapture={(e) => {
              if ((e.target as Element).closest("a")) {
                onClose();
              }
            }}
            {...tid.mobileMenuPanel}
          >
            <AppNavItems items={items} panelCollapsed={false} {...tid} />
          </nav>
        </motion.aside>
      </FocusScope>
    </>
  );
}
