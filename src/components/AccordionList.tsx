import { useState } from "react";
import { useTestIds } from "..";
import { Accordion, AccordionProps, AccordionSize } from "./Accordion";

interface AccordionListProps {
  accordions: AccordionProps[];
  /** Allows multiple accordions to be expanded simultaneously (enabled by default) */
  allowMultipleExpanded?: boolean;
  size?: AccordionSize;
}

export function AccordionList(props: AccordionListProps) {
  const { accordions, size, allowMultipleExpanded = true } = props
  const [expandedIndex, setExpandedIndex] = useState<number>();
  const tid = useTestIds(props, "accordionList");

  return (
    <>
      {accordions.map((accordionProps, index, arr) => (
        <Accordion
          {...accordionProps}
          {...tid}
          key={index}
          size={size}
          bottomBorder={index === arr.length - 1}
          defaultExpanded={!allowMultipleExpanded && expandedIndex===index}
          index={index}
          setExpandedIndex={setExpandedIndex}
        />
      ))}
    </>
  );
}