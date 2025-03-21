import { ObjectState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { createRef, RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { Css } from "src/Css";
import { BoundForm, BoundFormInputConfig } from "src/forms";
import { useTestIds } from "src/utils";
import { Button, ButtonProps } from "../Button";
import { Icon, IconKey } from "../Icon";
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
  submitAction?: ActionButtonProps;
  cancelAction?: ActionButtonProps;
  tertiaryAction?: ActionButtonProps;
};

/** In order to make the multiple stacked sticky elements work (Header, then sidebar below) we need to set the header height.
 * The alternate solution was to have multiple defined grid areas for the fixed header vs body below, but this becomes more complex
 * to manage when adding in a max content width container for the page while keeping the page scrollbar to the far right of the page.
 * Rather than wrapping the page in a max-width div, we use "gutter" columns `minMax(0, auto)` that kick in when all other columns have met their max widths.
 */
const headerHeightPx = 120;

export function FormPageLayout<F>(props: FormPageLayoutProps<F>) {
  const { formSections, formState } = props;

  const tids = useTestIds(props, "formPageLayout");

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

  const gridColumns =
    "minMax(0, auto) minMax(100px, 250px) minMax(350px, 1000px) minMax(min-content, 300px) minMax(0, auto)";

  return (
    // This page is `fixed` to the full screen to allow it to act as a full screen modal while content is mounted below
    // Adding "align-items: start" allows "position: sticky" to work within a grid for the sidebars
    <div
      css={Css.fixed.top0.bottom0.left0.right0.z(1000).oya.bgWhite.dg.gtc(gridColumns).gtr("auto 1fr").cg3.ais.$}
      {...tids}
    >
      <PageHeader {...props} {...tids.pageHeader} />
      <LeftNav sectionsWithRefs={sectionsWithRefs} {...tids.nav} />
      <FormSections sectionsWithRefs={sectionsWithRefs} formState={formState} {...tids} />
      <SidebarContent />
    </div>
  );
}

function PageHeader<F>(props: FormPageLayoutProps<F>) {
  const { pageTitle, breadCrumb, submitAction, cancelAction, tertiaryAction, formState } = props;

  const tids = useTestIds(props);

  return (
    <header css={Css.gr(1).gc("2 / 5").sticky.top0.hPx(headerHeightPx).bgWhite.z5.$} {...tids}>
      <div css={Css.py2.px3.df.jcsb.aic.$}>
        <div>
          {breadCrumb && <PageHeaderBreadcrumbs breadcrumb={breadCrumb} />}
          <h1 css={Css.xl3Sb.$} {...tids.pageTitle}>
            {pageTitle}
          </h1>
        </div>
        <Observer>
          {() => (
            <div css={Css.df.gap1.$}>
              {tertiaryAction && (
                <Button
                  label={tertiaryAction.label}
                  onClick={tertiaryAction.onClick}
                  variant="tertiary"
                  disabled={tertiaryAction.disabled}
                  tooltip={tertiaryAction.tooltip}
                  {...tids.tertiaryAction}
                />
              )}
              {cancelAction && (
                <Button
                  label={cancelAction.label}
                  onClick={cancelAction.onClick}
                  variant="secondary"
                  disabled={cancelAction.disabled}
                  tooltip={cancelAction.tooltip}
                  {...tids.cancelAction}
                />
              )}
              {submitAction && (
                <Button
                  label={submitAction.label}
                  onClick={submitAction.onClick}
                  variant="primary"
                  disabled={!formState.valid || submitAction.disabled}
                  tooltip={submitAction.tooltip}
                  {...tids.submitAction}
                />
              )}
            </div>
          )}
        </Observer>
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

  return (
    <article css={Css.gr(2).gc("3 / 4").$}>
      {sectionsWithRefs.map(({ section, ref, sectionKey }, i) => (
        // Subgrid here allows for icon placement to the left of the section content
        <section
          key={sectionKey}
          id={sectionKey}
          ref={ref}
          css={Css.dg.gtc("50px 1fr").gtr("auto").mb3.add("scrollMarginTop", `${headerHeightPx}px`).$}
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

  const activeSection = useActiveSection(sectionsWithRefs);

  const handleNavClick = useCallback((ref: RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <aside css={Css.gr(2).gc("2 / 3").sticky.topPx(headerHeightPx).px3.df.fdc.gap1.$} {...tids}>
      {sectionsWithRefs.map(({ section, ref, sectionKey }, i) => (
        <div
          key={`nav-${section.title ?? i}`}
          css={Css.cursorPointer.baseSb.gray900.if(activeSection === sectionKey).blue700.$}
          onClick={() => handleNavClick(ref)}
        >
          {section.title}
        </div>
      ))}
    </aside>
  );
}

/**
 * TODO: [SC-67748] Leaving the markup here for the grid alignment for the next ticket, however the real sidebar
 * will need to account for multiple possible content sections similar to the existing `Tab` component.
 */
function SidebarContent() {
  return null;
  // const [sideBarIsOpen, setSideBarIsOpen] = useState(false);

  // if (!sideBarIsOpen)
  //   return (
  //     <aside css={Css.gr(2).gc("4 / 5").sticky.topPx(headerHeightPx).$}>
  //       <div css={Css.br100.wPx(50).hPx(50).bcGray300.ba.df.jcc.aic.$}>
  //         <IconButton onClick={() => setSideBarIsOpen(true)} icon="comment" inc={3.5} />
  //       </div>
  //     </aside>
  //   );

  // return (
  //   <aside css={Css.gr(2).gc("4 / 5").sticky.topPx(headerHeightPx).$}>
  //     <div css={Css.dg.gtc("3fr 1fr").gtr("auto").gap1.maxh("calc(100vh - 150px)").oa.$}>
  //       <div></div>
  //       <div css={Css.br100.wPx(50).hPx(50).bcGray300.ba.df.jcc.aic.$}>
  //         <IconButton onClick={() => setSideBarIsOpen(false)} icon="x" inc={3.5} />
  //       </div>
  //     </div>
  //   </aside>
  // );
}

function useActiveSection<F>(sectionsWithRefs: SectionWithRefs<F>[]) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    // Ensure the browser supports the Intersection Observer API (and skip in tests where it's not available)
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: `-${headerHeightPx}px 0px 0px 0px`, threshold: 0.5 },
    );

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
  }, [sectionsWithRefs]);

  return activeSection;
}
