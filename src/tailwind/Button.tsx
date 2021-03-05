import React, { FC, useRef } from 'react';
import { useButton } from "react-aria"
import type { AriaButtonProps } from "@react-types/button";

export interface ButtonProps extends AriaButtonProps {
  btnType: "primary" | "secondary" | "tertiary"
}

export const Button: FC<ButtonProps> = (props) => {
  let ref = useRef(null);
  let { buttonProps } = useButton(props, ref);
  let { children } = props;

  return (
    <button {...buttonProps} ref={ref} className={`btn-${props.btnType}`}>
      {children}
    </button>
  );
};

