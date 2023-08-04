import { useState } from "react";
import { useTestIds } from "..";
import { Accordion, AccordionProps, AccordionSize } from "./Accordion";

interface AccordionListProps {
  accordions: AccordionProps[];
  /** Allows multiple accordions to be expanded simultaneously (enabled by default) */
  allowMultipleExpanded?: boolean;
  size?: AccordionSize;
  /** Modifies the typography, padding, icon size and background color of the accordion header */
  compact?: boolean;
}

export function AccordionList(props: AccordionListProps) {
  const { accordions, size, allowMultipleExpanded = true, compact = false } = props;
  const [expandedIndex, setExpandedIndex] = useState<number | undefined>(
    accordions.findIndex((a) => a.defaultExpanded),
  );
  const tid = useTestIds(props, "accordionList");

  return (
    <>
      {accordions.map((accordionProps, index, arr) => (
        <Accordion
          {...accordionProps}
          {...tid}
          compact={compact}
          key={index}
          size={size}
          bottomBorder={compact ? false : index === arr.length - 1}
          defaultExpanded={!allowMultipleExpanded && expandedIndex === index}
          index={index}
          setExpandedIndex={setExpandedIndex}
        />
      ))}
    </>
  );
}
