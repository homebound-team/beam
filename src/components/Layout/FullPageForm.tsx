import { ObjectState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { ReactNode, useState } from "react";
import { Css } from "src/Css";
import { BoundForm, BoundFormInputConfig } from "src/forms";
import { Button, ButtonProps } from "../Button";
import { Icon, IconKey } from "../Icon";
import { IconButton } from "../IconButton";

export type FormSectionConfig<F> = {
  title?: string;
  icon?: IconKey;
  rows: BoundFormInputConfig<F>;
}[];

type ActionButtonProps = Pick<ButtonProps, "onClick" | "label" | "disabled" | "tooltip">;

type FullPageFormProps<F> = {
  pageTitle: string;
  breadCrumbs?: ReactNode;
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

export function FullPageForm<F>(props: FullPageFormProps<F>) {
  const { formSections, formState } = props;

  const gridColumns = `minMax(0, auto) minMax(min-content, 250px) minMax(250px, 1000px) minMax(min-content, 300px) minMax(0, auto)`;

  return (
    // This page is `fixed` to the full screen to allow it to act as a full screen modal while content is mounted below
    // Adding "align-items: start" allows "position: sticky" to work within a grid for the sidebars
    <div css={Css.fixed.top0.bottom0.left0.right0.oya.bgWhite.dg.gtc(gridColumns).gtr("auto 1fr").cg3.ais.$}>
      <PageHeader {...props} />
      <LeftNav />
      <FormSections formSections={formSections} formState={formState} />
      <SidebarContent />
    </div>
  );
}

function PageHeader<F>(props: FullPageFormProps<F>) {
  const { pageTitle, breadCrumbs, submitAction, cancelAction, tertiaryAction, formState } = props;

  return (
    <header css={Css.gr(1).gc("2 / 5").sticky.top0.hPx(headerHeightPx).bgWhite.z5.$}>
      <div css={Css.py2.px3.df.jcsb.aic.$}>
        <div>
          {breadCrumbs && breadCrumbs}
          <h1 css={Css.xl3Sb.$}>{pageTitle}</h1>
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
                />
              )}
              {cancelAction && (
                <Button
                  label={cancelAction.label}
                  onClick={cancelAction.onClick}
                  variant="secondary"
                  disabled={cancelAction.disabled}
                  tooltip={cancelAction.tooltip}
                />
              )}
              {submitAction && (
                <Button
                  label={submitAction.label}
                  onClick={submitAction.onClick}
                  variant="primary"
                  disabled={!formState.valid || submitAction.disabled}
                  tooltip={submitAction.tooltip}
                />
              )}
            </div>
          )}
        </Observer>
      </div>
    </header>
  );
}

function FormSections<F>(props: Pick<FullPageFormProps<F>, "formSections" | "formState">) {
  const { formSections, formState } = props;

  return (
    <article css={Css.gr(2).gc("3 / 4").$}>
      {formSections.map((section, i) => (
        // Subgrid here allows for icon placement to the left of the section content
        <section key={`section-${section.title ?? i}`} css={Css.dg.gtc("50px 1fr").gtr("auto").$}>
          <div css={Css.gc(1).$}>{section.icon && <Icon icon={section.icon} inc={4.5} />}</div>
          <div css={Css.gc(2).$}>
            {section.title && <h2 css={Css.xlSb.mb3.$}>{section.title}</h2>}
            <BoundForm formState={formState} rows={section.rows} />
          </div>
        </section>
      ))}
    </article>
  );
}

function LeftNav() {
  return (
    <aside css={Css.gr(2).gc("2 / 3").sticky.topPx(headerHeightPx).px3.df.fdc.gap1.$}>
      <Button onClick="" label="Link A" variant="tertiary" />
      <Button onClick="" label="Link B" variant="tertiary" />
      <Button onClick="" label="Link C" variant="tertiary" />
    </aside>
  );
}

// The real sidebar will need to account for multiple possible components such as history and comments
function SidebarContent() {
  const [sideBarIsOpen, setSideBarIsOpen] = useState(false);

  if (!sideBarIsOpen)
    return (
      <aside css={Css.gr(2).gc("4 / 5").sticky.topPx(headerHeightPx).$}>
        <div css={Css.br100.wPx(50).hPx(50).bcGray100.ba.df.jcc.aic.$}>
          <IconButton onClick={() => setSideBarIsOpen(true)} icon="comment" inc={3} />
        </div>
      </aside>
    );

  return (
    <aside css={Css.gr(2).gc("4 / 5").sticky.topPx(headerHeightPx).$}>
      <div css={Css.dg.gtc("3fr 1fr").gtr("auto").gap1.maxh("calc(100vh - 150px)").oa.$}>
        <div>
          <h3 css={Css.lgSb.mb2.$}>Comments</h3>
          <div css={Css.w100.hPx(50).bgGray200.mt3.br4.$} />
          <div css={Css.w100.hPx(50).bgGray200.mt3.br4.$} />
          <div css={Css.w100.hPx(50).bgGray200.mt3.br4.$} />
          <div css={Css.w100.hPx(50).bgGray200.mt3.br4.$} />
          <div css={Css.w100.hPx(50).bgGray200.mt3.br4.$} />
          <div css={Css.w100.hPx(50).bgGray200.mt3.br4.$} />
          <div css={Css.w100.hPx(50).bgGray200.mt3.br4.$} />
          <div css={Css.w100.hPx(50).bgGray200.mt3.br4.$} />
          <div css={Css.w100.hPx(50).bgGray200.mt3.br4.$} />
          <div css={Css.w100.hPx(50).bgGray200.mt3.br4.$} />
        </div>
        <div css={Css.br100.wPx(50).hPx(50).bcGray100.ba.df.jcc.aic.$}>
          <IconButton onClick={() => setSideBarIsOpen(false)} icon="x" inc={3} />
        </div>
      </div>
    </aside>
  );
}
