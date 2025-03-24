import { ObjectState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { Css } from "src/Css";
import { BoundForm, BoundFormInputConfig } from "src/forms";
import { useTestIds } from "src/utils";
import { Button, ButtonProps } from "../Button";
import { Icon, IconKey } from "../Icon";
import { HeaderBreadcrumb, PageHeaderBreadcrumbs } from "./PageHeaderBreadcrumbs";

export type FormSectionConfig<F> = {
  title?: string;
  icon?: IconKey;
  rows: BoundFormInputConfig<F>;
}[];

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

  // The grid columns are defined as: "left-gutter, left-nav, form-content, right-sidebar, right-gutter"
  const gridColumns =
    "minMax(0, auto) minMax(100px, 250px) minMax(350px, 1000px) minMax(min-content, 300px) minMax(0, auto)";

  return (
    // This page is `fixed` to the full screen to allow it to act as a full screen modal while content is mounted below
    // since this layout will be replacing most superdrawers/sidebars, we keep the listing mounted below to preserve the users's
    // scroll position & filters
    // Adding "align-items: start" allows "position: sticky" to work within a grid for the sidebars
    <div
      css={Css.fixed.top0.bottom0.left0.right0.z(1000).oya.bgWhite.dg.gtc(gridColumns).gtr("auto 1fr").cg3.ais.$}
      {...tids}
    >
      <PageHeader {...props} {...tids.pageHeader} />
      <LeftNav formSections={formSections} {...tids.nav} />
      <FormSections formSections={formSections} formState={formState} {...tids} />
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

function FormSections<F>(props: Pick<FormPageLayoutProps<F>, "formSections" | "formState">) {
  const { formSections, formState } = props;

  const tids = useTestIds(props);

  return (
    <article css={Css.gr(2).gc("3 / 4").$}>
      {formSections.map((section, i) => (
        // Subgrid here allows for icon placement to the left of the section content
        <section
          key={`section-${section.title ?? i}`}
          css={Css.dg.gtc("50px 1fr").gtr("auto").mb3.$}
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

function LeftNav<F>(props: Pick<FormPageLayoutProps<F>, "formSections">) {
  const tids = useTestIds(props);

  return (
    <aside css={Css.gr(2).gc("2 / 3").sticky.topPx(headerHeightPx).px3.df.fdc.gap1.$} {...tids}>
      {/* Content TODO here: [SC-67747] to implement new NavLink component and section scroll-to behavior */}
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
