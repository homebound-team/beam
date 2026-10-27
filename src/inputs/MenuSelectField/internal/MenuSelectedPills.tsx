import { useState } from "react";
import { Carousel } from "src/components/Carousel";
import { Icon } from "src/components/Icon";
import { FilterPill } from "src/components/Pills/FilterPill/FilterPill";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type MenuSelectedOption = {
  key: string;
  label: string;
  /** False when the option can be cleared. A string is why it cannot, shown as the pill's tooltip. */
  disabled: boolean | string;
};

export type MenuSelectedPillsProps = {
  options: MenuSelectedOption[];
  onDeselect: (key: string) => void;
};

/** Selected options above a menu's search. One scrolling line, or wrapped and capped at 40% of the menu. */
export function MenuSelectedPills(props: MenuSelectedPillsProps) {
  const { options, onDeselect } = props;
  const [expanded, setExpanded] = useState(false);
  const tid = useTestIds(props, "selections");
  if (options.length === 0) return null;

  const pills = options.map((option) => (
    <FilterPill
      key={option.key}
      text={option.label}
      disabled={option.disabled}
      onClick={() => {
        if (!option.disabled) onDeselect(option.key);
      }}
      {...tid.pill}
    />
  ));

  return (
    <div
      role="group"
      aria-label="Selected options"
      // Pointer-only. Keep DOM focus on the search input or list.
      onMouseDown={(event) => event.preventDefault()}
      css={
        Css.df.gap1.px2
          .pyPx(12)
          .bb.bc(Tokens.SurfaceSeparator)
          .fs0.wPx(0)
          .mw100.if(expanded)
          .aifs.maxh(expandedMaxHeight).oxh.oya.overscrollContain.mh0.else.aic.end.$
      }
      {...tid}
    >
      {expanded ? (
        <div css={Css.df.fww.gapPx(8).fg1.mw0.add("alignContent", "flex-start").$} {...tid.options}>
          {pills}
        </div>
      ) : (
        <div css={Css.fg1.mw0.$}>
          <Carousel chevronInc={2} {...tid.carousel}>
            {pills}
          </Carousel>
        </div>
      )}
      <button
        type="button"
        tabIndex={-1}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse selected options" : "Expand selected options"}
        onClick={() => setExpanded((open) => !open)}
        css={
          Css.df.aic.jcc.fs0.p0.bn.bgTransparent.cursorPointer.color(Tokens.OnSurface).outline0.if(expanded).sticky.top0
            .end.onFocusVisible.bshFocus.$
        }
        {...tid.toggle}
      >
        <Icon icon={expanded ? "collapse" : "expand"} inc={2} />
      </button>
    </div>
  );
}

/** Expanded pills scroll once they pass this share of `--menu-max-height`. */
const expandedMaxHeight = "calc(var(--menu-max-height, 512px) * 0.4)";
