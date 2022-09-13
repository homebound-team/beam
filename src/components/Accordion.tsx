import { Css, IconButton, useTestIds } from "src/index";
import { ReactNode, useState } from "react";

export interface AccordionProps {
  title: string;
  children: ReactNode;
  disabled?: boolean;
  defaultExpanded?: boolean;
  bottomSection?: boolean;
}

export function Accordion(props: AccordionProps) {
  const { title, children, disabled = false, defaultExpanded = false, bottomSection = false} = props;
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [focused, setFocused] = useState(false);
  const testIds = useTestIds({}, "accordion");

  return (
    <div
      {...testIds}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      // Remove default border when focused
      css={Css.if(!focused).bt.bGray400.if(bottomSection && !(!expanded && focused)).bb.$}
    >
      <div {...testIds.summary} css={Css.df.if(focused).ba.bLightBlue600.bw2.addIn(":hover", Css.bgGray100.$).$}>
        <div {...testIds.title} css={Css.p2.baseEm.fw5.if(disabled).gray500.$}>
          {title}
        </div>
        <div css={Css.ml("auto").my("auto").pr1.$}>
          <IconButton
            {...testIds.button}
            disabled={disabled}
            icon={expanded ? "chevronUp" : "chevronDown"}
            onClick={() => setExpanded(!expanded)}
          />
        </div>
      </div>
      <div {...testIds.details} css={Css.px2.pb2.pt1.if(!expanded).dn.$}>
        {children}
      </div>
    </div>
  );
}
