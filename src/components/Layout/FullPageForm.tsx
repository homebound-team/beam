import { ObjectState } from "@homebound/form-state";
import { AnimatePresence, motion } from "framer-motion";
import { Dispatch, Fragment, ReactNode, SetStateAction, useState } from "react";
import { Css } from "src/Css";
import { BoundForm, BoundFormInputConfig } from "src/forms";
import { Button } from "../Button";
import { IconKey } from "../Icon";
import { IconButton } from "../IconButton";

export type FormSectionConfig<F> = {
  title?: string;
  icon?: IconKey;
  rows: BoundFormInputConfig<F>;
}[];

type FullPageFormProps<F> = {
  pageTitle: string;
  breadCrumbs?: ReactNode;
  actionButtons: ReactNode;
  formState: ObjectState<F>;
  formSections: FormSectionConfig<F>;
  // It may make sense to have this page level own the top-level "Sections" (rather than BoundForm rendering them)
  // since we need to do the sidebar links (and probably do an intersection observer for the top most section in view?)
  // so we'd render multiple `BoundForm` instances for each section
  // boundFormProps: BoundFormProps<F>;
  // Will have to decide how much of this component is composable via react nodes, vs how much we can constrain
  // for the submit actions, the figma points to 3 possible buttons: Primary/Submit, Cancel/Secondary, and Text/Tertiary
  // we could just expose the bare minimum props for these buttons
  // submitBtnProps: ButtonProps;
};

/** In order to make the multiple stacked sticky elements work (Header, then sidebar below) we need to set the header height.
 * The alternate solution was to have multiple defined grid areas for the fixed header vs body below, but this becomes more complex
 * to manage when adding in a max content width container for the page while keeping the page scrollbar to the far right of the page.
 * Rather than wrapping the page in a max-width div, we use "gutter" columns `minMax(0, auto)` that kick in when all other columns have met their max widths.
 */
const headerHeightPx = 120;

export function FullPageForm<F>(props: FullPageFormProps<F>) {
  const { pageTitle, breadCrumbs, actionButtons, formSections, formState } = props;

  const [sideBarIsOpen, setSideBarIsOpen] = useState(false);

  const rightSidebarCol = sideBarIsOpen ? "400px" : "minMax(100px, 300px)";
  const gridColumns = `minMax(0, auto) minMax(min-content, 250px) minMax(250px, 1000px) ${rightSidebarCol} minMax(0, auto)`;

  return (
    // Adding "align-items: start" allows "position: sticky" to work within a grid for the sidebars
    <div css={Css.mvh100.w100.bgWhite.dg.gtc(gridColumns).gtr("auto 1fr").cg3.ais.$}>
      <PageHeader pageTitle={pageTitle} breadCrumbs={breadCrumbs} actionButtons={actionButtons} />
      <aside css={Css.gr(2).gc("2 / 3").sticky.topPx(headerHeightPx).px3.df.fdc.gap1.$}>
        <Button onClick="" label="Link A" variant="tertiary" />
        <Button onClick="" label="Link B" variant="tertiary" />
        <Button onClick="" label="Link C" variant="tertiary" />
      </aside>
      <article css={Css.gr(2).gc("3 / 4").$}>
        {formSections.map((section, i) => (
          <Fragment key={`section-${i}`}>
            {section.title && <h2 css={Css.xlSb.mb3.$}>{section.title}</h2>}
            <BoundForm formState={formState} rows={section.rows} />
          </Fragment>
        ))}
      </article>
      <SidebarContent sideBarIsOpen={sideBarIsOpen} setSideBarIsOpen={setSideBarIsOpen} />
    </div>
  );
}

function PageHeader<F>(props: Pick<FullPageFormProps<F>, "pageTitle" | "breadCrumbs" | "actionButtons">) {
  const { pageTitle, breadCrumbs, actionButtons } = props;

  return (
    <header css={Css.gr(1).gc("2 / 5").sticky.top0.hPx(headerHeightPx).bgWhite.z5.$}>
      <div css={Css.py2.px3.df.jcsb.aic.$}>
        <div>
          {breadCrumbs && breadCrumbs}
          <h1 css={Css.xl3Sb.$}>{pageTitle}</h1>
        </div>
        <div css={Css.df.gap1.$}>{actionButtons}</div>
      </div>
    </header>
  );
}

// The real sidebar will need to account for multiple possible components such as history and comments
function SidebarContent({
  sideBarIsOpen,
  setSideBarIsOpen,
}: {
  sideBarIsOpen: boolean;
  setSideBarIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
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
      <AnimatePresence>
        {sideBarIsOpen && (
          <motion.div
            layout="position"
            key="rightPane"
            data-testid="rightPaneContent"
            initial={{ x: 350, position: "absolute" }}
            animate={{ x: 0 }}
            transition={{ ease: "linear", duration: 0.2 }}
            exit={{ transition: { ease: "linear", duration: 0.2 }, x: 350 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
