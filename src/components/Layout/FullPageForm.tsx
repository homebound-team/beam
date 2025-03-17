import { ObjectState } from "@homebound/form-state";
import { AnimatePresence, motion } from "framer-motion";
import { Dispatch, Fragment, ReactNode, SetStateAction, useState } from "react";
import { Css } from "src/Css";
import { BoundForm, BoundFormProps } from "src/forms";
import { Button } from "../Button";
import { IconKey } from "../Icon";
import { IconButton } from "../IconButton";

export type FormSectionConfig<F> = {
  title?: string;
  icon?: IconKey;
  rows: BoundFormProps<F>["inputRows"];
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

export function FullPageForm<F>(props: FullPageFormProps<F>) {
  const { pageTitle, breadCrumbs, actionButtons, formSections, formState } = props;

  const [sideBarIsOpen, setSideBarIsOpen] = useState(false);

  return (
    <div css={Css.vh100.add("width", "100vw").bgWhite.$}>
      {/* Though the grid layout should manage the full page, we want to contain it within a max width for very wide screens */}
      <div
        css={
          Css.dg
            // .gtc(sideBarIsOpen ? "220px 1fr 400px" : "220px 3fr 1fr")
            .gtc("auto")
            .gtr("auto 1fr")
            .cg2.maxwPx(1800).h100.ma.$
        }
      >
        <header css={Css.gr(1).gc("1 / 2").py2.px3.df.jcsb.aic.$}>
          <div>
            {breadCrumbs && breadCrumbs}
            <h1 css={Css.xl3Sb.$}>{pageTitle}</h1>
          </div>
          <div css={Css.df.gap1.$}>{actionButtons}</div>
        </header>
        {/* Adding "align-items: start" allows "position: sticky" to work within a grid for the sidebars */}
        <article css={Css.dg.gtc(sideBarIsOpen ? "220px 1fr 400px" : "220px 3fr 1fr").gc("1 /2 ").oa.ais.$}>
          <aside css={Css.gr(1).gc("1 / 2").sticky.top0.px3.py2.df.fdc.gap1.$}>
            <Button onClick="" label="Link A" variant="tertiary" />
            <Button onClick="" label="Link B" variant="tertiary" />
            <Button onClick="" label="Link C" variant="tertiary" />
          </aside>
          <article css={Css.gr(1).gc("2 / 3").mr2.pr1.$}>
            {formSections.map((section, i) => (
              <Fragment key={`section-${i}`}>
                {section.title && <h2 css={Css.xlSb.mb3.$}>{section.title}</h2>}
                <BoundForm formState={formState} inputRows={section.rows} />
              </Fragment>
            ))}
          </article>
          <SidebarContent sideBarIsOpen={sideBarIsOpen} setSideBarIsOpen={setSideBarIsOpen} />
        </article>
      </div>
    </div>
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
      <aside css={Css.gr(1).gc("3 / 4").sticky.top0.py2.$}>
        <div css={Css.br100.wPx(50).hPx(50).bcGray100.ba.df.jcc.aic.$}>
          <IconButton onClick={() => setSideBarIsOpen(true)} icon="comment" inc={3} />
        </div>
      </aside>
    );

  return (
    <aside css={Css.gr(1).gc("3 / 4").sticky.top0.py2.$}>
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
