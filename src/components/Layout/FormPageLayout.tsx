import { ObjectState } from "@homebound/form-state";
import React, { createRef, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useButton, useFocusRing } from "react-aria";
import { Css, Palette } from "src/Css";
import { BoundForm, BoundFormInputConfig, SubmitButton } from "src/forms";
import { useHover } from "src/hooks";
import { useTestIds } from "src/utils";
import { useDebouncedCallback } from "use-debounce";
import { Button, ButtonProps } from "../Button";
import { Icon, IconKey } from "../Icon";
import { RIGHT_SIDEBAR_MIN_WIDTH, RightSidebar, SidebarContentProps } from "../RightSidebar";
import { Toast } from "../Toast/Toast";
import { useToastContext } from "../Toast/ToastContext";
import { HeaderBreadcrumb, PageHeaderBreadcrumbs } from "./PageHeaderBreadcrumbs";

type FormSection<F> = {
  title?: string;
  icon?: IconKey;
  rows: BoundFormInputConfig<F>;
};

export type FormSectionConfig<F> = FormSection<F>[];

type ActionButtonProps = Pick<ButtonProps, "onClick" | "label" | "disabled" | "tooltip">;

type FormPageLayoutProps<F> = {
  pageTitle: string;
  breadCrumb?: HeaderBreadcrumb | HeaderBreadcrumb[];
  formState: ObjectState<F>;
  formSections: FormSectionConfig<F>;
  submitAction: ActionButtonProps;
  cancelAction?: ActionButtonProps;
  tertiaryAction?: ActionButtonProps;
  rightSideBar?: SidebarContentProps[];
};

/** In order to make the multiple stacked sticky elements work (Header, then sidebar below) we need to set the header height.
 * The alternate solution was to have multiple defined grid areas for the fixed header vs body below, but this becomes more complex
 * to manage when adding in a max content width container for the page while keeping the page scrollbar to the far right of the page.
 * Rather than wrapping the page in a max-width div, we use "gutter" columns `minMax(0, auto)` that kick in when all other columns have met their max widths.
 */
const headerHeightPx = 120;
const maxContentWidthPx = 1600;

function FormPageLayoutComponent<F>(props: FormPageLayoutProps<F>) {
  const { formSections, formState, rightSideBar } = props;
  const tids = useTestIds(props, "formPageLayout");

  // Create a ref for each section here so we can coordinate both the `scrollIntoView`
  // and the `IntersectionObserver` behaviors between the `LeftNav` and `FormSections` children
  const sectionsWithRefs = useMemo(
    () =>
      formSections.map((section, id) => ({
        section,
        ref: createRef<HTMLElement>(),
        // Unique key for each section to use in the observer
        sectionKey: `section-${section.title ?? id}`,
      })),
    [formSections],
  );

  // The grid columns are defined as: "left-nav, form-content, right-sidebar"
  const gridColumns = `minMax(100px, 250px) minMax(350px, 1000px) minMax(${RIGHT_SIDEBAR_MIN_WIDTH}, 380px)`;

  return (
    // This page is `fixed` to the full screen to allow it to act as a full screen modal while content is mounted below
    // since this layout will be replacing most superdrawers/sidebars, we keep the listing mounted below to preserve the users's
    // scroll position & filters
    // Adding "align-items: start" allows "position: sticky" to work within a grid for the sidebars
    <div css={Css.fixed.top0.bottom0.left0.right0.z(1000).oya.bgWhite.df.jcc.aifs.$} {...tids}>
      <div css={Css.w100.maxwPx(maxContentWidthPx).dg.gtc(gridColumns).gtr("auto 1fr").cg3.ais.$}>
        <PageHeader {...props} {...tids.pageHeader} />
        <LeftNav sectionsWithRefs={sectionsWithRefs} {...tids} />
        <FormSections sectionsWithRefs={sectionsWithRefs} formState={formState} {...tids} />
        {rightSideBar && (
          <aside css={Css.gr(2).gc("3 / 4").sticky.topPx(headerHeightPx).$}>
            <RightSidebar content={rightSideBar} headerHeightPx={headerHeightPx} />
          </aside>
        )}
      </div>
    </div>
  );
}

export const FormPageLayout = React.memo(FormPageLayoutComponent) as typeof FormPageLayoutComponent;

function PageHeader<F>(props: FormPageLayoutProps<F>) {
  const { pageTitle, breadCrumb, submitAction, cancelAction, tertiaryAction, formState } = props;
  const { notice } = useToastContext();
  const tids = useTestIds(props);

  return (
    <header css={Css.gr(1).gc("1 / 4").sticky.top0.bgWhite.z5.if(!notice).hPx(headerHeightPx).$} {...tids}>
      <Toast />
      <div css={Css.py2.px3.df.jcsb.aic.$}>
        <div>
          {breadCrumb && <PageHeaderBreadcrumbs breadcrumb={breadCrumb} />}
          <h1 css={Css.xl3Sb.$} {...tids.pageTitle}>
            {pageTitle}
          </h1>
        </div>

        <div css={Css.df.gap1.$}>
          {tertiaryAction && (
            <Button
              label={tertiaryAction.label}
              onClick={tertiaryAction.onClick}
              variant="tertiary"
              disabled={tertiaryAction.disabled}
              tooltip={tertiaryAction.tooltip}
            />
          )}
          {cancelAction && (
            <Button
              label={cancelAction.label}
              onClick={cancelAction.onClick}
              variant="quaternary"
              disabled={cancelAction.disabled}
              tooltip={cancelAction.tooltip}
            />
          )}
          <SubmitButton form={formState} {...submitAction} />
        </div>
      </div>
    </header>
  );
}

type SectionWithRefs<F> = {
  ref: RefObject<HTMLElement>;
  section: FormSection<F>;
  sectionKey: string;
};

type FormSectionsProps<F> = {
  formState: ObjectState<F>;
  sectionsWithRefs: SectionWithRefs<F>[];
};

function FormSections<F>(props: FormSectionsProps<F>) {
  const { sectionsWithRefs, formState } = props;

  const tids = useTestIds(props);
  // Adding extra bottom padding for multi-section forms allows the scroll-to behavior to get more of the bottom section in view
  const bottomPaddingPx = sectionsWithRefs.length > 1 ? 200 : 0;

  return (
    <article css={Css.gr(2).gc("2 / 3").pbPx(bottomPaddingPx).pr2.$}>
      {sectionsWithRefs.map(({ section, ref, sectionKey }, i) => (
        // Subgrid here allows for icon placement to the left of the section content
        <section
          key={sectionKey}
          // `sectionKey` as the `id` is used by the IntersectionObserver to determine which section is currently in view
          id={sectionKey}
          ref={ref}
          // scrollMarginTop here ensures the top of the section is properly aligned when calling `scrollIntoView`
          css={Css.dg.gtc("50px 1fr").gtr("auto").mbPx(72).add("scrollMarginTop", `${headerHeightPx}px`).$}
          {...tids.formSection}
        >
          <div css={Css.gc(1).$}>{section.icon && <Icon icon={section.icon} inc={3.5} />}</div>
          <div css={Css.gc(2).$}>
            {section.title && <h2 css={Css.xlSb.mb3.$}>{section.title}</h2>}
            <BoundForm formState={formState} rows={section.rows} />
          </div>
        </section>
      ))}
    </article>
  );
}

function LeftNav<F>(props: { sectionsWithRefs: SectionWithRefs<F>[] }) {
  const { sectionsWithRefs } = props;
  const tids = useTestIds(props);

  // Ignore sections that don't have titles defined
  const sectionWithTitles = useMemo(
    () => sectionsWithRefs.filter(({ section }) => !!section.title),
    [sectionsWithRefs],
  );

  const activeSection = useActiveSection(sectionWithTitles);

  return (
    <aside css={Css.gr(2).gc("1 / 2").sticky.topPx(headerHeightPx).px3.df.fdc.gap1.$} {...tids.nav}>
      {sectionWithTitles.map((sectionWithRef) => (
        <SectionNavLink
          key={`nav-${sectionWithRef.sectionKey}`}
          sectionWithRef={sectionWithRef}
          activeSection={activeSection}
          {...tids}
        />
      ))}
    </aside>
  );
}

// Use inset box shadow rather than thick border to avoid the button text reflowing when the border is applied
const activeStyles = Css.smBd.boxShadow(`inset 3px 0px 0 0px ${Palette.Blue600}`).$;
const hoverStyles = Css.bgBlue50.smBd.blue900.boxShadow(`inset 3px 0px 0 0px ${Palette.Blue900}`).$;
const defaultFocusRingStyles = Css.relative.z2.bshFocus.$;

function SectionNavLink<F>(props: { sectionWithRef: SectionWithRefs<F>; activeSection: string | null }) {
  const { sectionWithRef, activeSection } = props;
  const { section, ref: sectionRef } = sectionWithRef;

  const active = activeSection === sectionWithRef.sectionKey;

  const handleNavClick = useCallback(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [sectionRef]);

  const tids = useTestIds(props);

  const buttonRef = useRef(null);
  const { buttonProps, isPressed } = useButton({ onPress: handleNavClick }, buttonRef);
  const { isFocusVisible, focusProps } = useFocusRing();
  const { hoverProps, isHovered } = useHover({});

  return (
    <button
      ref={buttonRef}
      {...buttonProps}
      {...focusProps}
      {...hoverProps}
      css={{
        ...Css.buttonBase.wsn.tal.smMd.blue600.px2.py1.br0.h100.$,
        ...(isFocusVisible ? defaultFocusRingStyles : {}),
        ...(active ? activeStyles : {}),
        ...(isPressed ? activeStyles : isHovered ? hoverStyles : {}),
      }}
      {...tids.sectionNavLink}
    >
      {section.title}
    </button>
  );
}

/**
 * Hook that wraps the browser `IntersectionObserver` API with a setState
 * in order to display the currently in-view section via the sidebar nav */
function useActiveSection<F>(sectionsWithRefs: SectionWithRefs<F>[]) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Use debounced callback to prevent rapid processing of intersection events during scrolling
  // This also prevents flickering when the user is scrolling slowly next to a section boundary
  const debouncedIntersectionCallback = useDebouncedCallback(
    (entries: IntersectionObserverEntry[]) => {
      // Filter to only sections that are intersecting and have a significant portion visible
      const sectionsInView = entries
        .filter((entry) => entry.isIntersecting && entry.intersectionRatio > 0.2)
        .sort((a, b) => {
          // First sort by how much of the section is visible
          const ratioDiff = b.intersectionRatio - a.intersectionRatio;
          if (Math.abs(ratioDiff) > 0.05) return ratioDiff;

          // If visibility is similar, prefer the section closer to the top of the viewport
          const aTop = a.boundingClientRect.top;
          const bTop = b.boundingClientRect.top;
          return aTop - bTop;
        });

      if (sectionsInView[0]) {
        setActiveSection(sectionsInView[0].target.id);
      }
    },
    200,
    { maxWait: 500 },
  );

  useEffect(() => {
    // Ensure the browser supports the Intersection Observer API (and skip in tests where it's not available)
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => debouncedIntersectionCallback(entries), {
      /**
       * Creating rules to determine when a section is "in view" is a real challenge given the section sizes
       * are unknown and will likely be mixed (optimizing for large sections makes tracking small sections
       * more difficult and vice versa). This approach attempts to solve for this by creating a narrowed
       * "focus zone" trying to approximate where a users attention is likely to be. In this case, blocking
       * out the top 25% and bottom 35% of the viewport to focus on the middle-top 40%.
       */
      rootMargin: "-25% 0px -35% 0px",
      // Multiple threshold points allow for more granular detection of section visibility
      threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    });

    sectionsWithRefs.forEach(({ ref }) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      sectionsWithRefs.forEach(({ ref }) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [sectionsWithRefs, debouncedIntersectionCallback]);

  return activeSection;
}
