import { useResizeObserver } from "@react-aria/utils";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { IconButton } from "src/components/IconButton";
import { FilterPill } from "src/components/Pills/FilterPill/FilterPill";
import { Css, increment, Tokens } from "src/Css";
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

/** Selected options above a menu's search. One line, or wrapped and capped at 40% of the menu. */
export function MenuSelectedPills(props: MenuSelectedPillsProps) {
  const { options, onDeselect } = props;
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  // State-based ref so the observer re-subscribes when the collapsed line mounts again.
  const [line, setLine] = useState<HTMLDivElement | null>(null);
  const lineRef = useMemo(() => ({ current: line }), [line]);
  const tid = useTestIds(props, "selections");

  const measureOverflow = useCallback(() => {
    if (!line) return;
    setOverflows(line.scrollWidth > line.clientWidth + 1);
  }, [line]);

  useLayoutEffect(() => {
    measureOverflow();
  }, [measureOverflow, options]);
  useResizeObserver({ ref: lineRef, onResize: measureOverflow });

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
        Css.df.gap1.px2.py1.bb.bc(Tokens.SurfaceSeparator).fs0.if(expanded).aifs.maxh(expandedMaxHeight).oxh.oya
          .overscrollContain.mh0.else.aic.$
      }
      {...tid}
    >
      {expanded ? (
        <div css={Css.df.fww.gap1.fg1.ptPx(1.5).mw0.add("alignContent", "flex-start").$} {...tid.options}>
          {pills}
        </div>
      ) : (
        <div ref={setLine} css={Css.fg1.mw0.df.gap1.oh.if(overflows).add("maskImage", overflowMask).$} {...tid.line}>
          {pills.map((pill) => (
            // Wrapping each pill with a `fs0` so they don't all truncate themselves super small to fit this one line.
            <div key={pill.key} css={Css.fs0.$}>
              {pill}
            </div>
          ))}
        </div>
      )}
      {(overflows || expanded) && (
        <div css={Css.df.fs0.sticky.top0.$}>
          <IconButton
            compact
            excludeFromTabOrder
            icon={expanded ? "collapse" : "expand"}
            aria-expanded={expanded}
            label={expanded ? "Collapse selected options" : "Expand selected options"}
            preventTooltip
            onClick={() => setExpanded((open) => !open)}
            {...tid.toggle}
          />
        </div>
      )}
    </div>
  );
}

/** Expanded pills scroll once they pass this share of `--menu-max-height`. */
const expandedMaxHeight = "calc(var(--menu-max-height, 512px) * 0.4)";

/** Fade the clipped end of the line. Masking the pills works on any background, same as the carousel. */
const overflowMask = `linear-gradient(90deg, black calc(100% - ${increment(3)}px), transparent calc(100% - ${increment(1)}px), transparent 100%)`;
