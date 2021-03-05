import React, { FC, useRef } from 'react';
import { useCheckbox } from "react-aria";
import { useToggleState } from "react-stately";
import type { AriaCheckboxProps } from "@react-types/checkbox";

export interface CheckboxProps extends AriaCheckboxProps {
}

export const Checkbox: FC<CheckboxProps> = (props) => {

  let { children } = props;
  let state = useToggleState(props);
  let ref = useRef(null);
  let { inputProps } = useCheckbox(props, state, ref);

  return (
    <label style={{ display: 'block' }}>
      <input {...inputProps} ref={ref} />
      {children}
    </label>
  );

}