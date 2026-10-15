import type { JSX } from "react";
import { BaseMenuSelectField } from "src/inputs/MenuSelectField/internal/BaseMenuSelectField";
import type { MenuSelectFieldProps } from "src/inputs/MenuSelectField/types";
import type { Value } from "src/inputs/Value";

/** Select whose trigger shows the value and opens a menu. Search is included when there are more than eight options. See `MenuSelectField.mdx`. */
export function MenuSelectField<O, V extends Value>(props: MenuSelectFieldProps<O, V>): JSX.Element {
  return <BaseMenuSelectField {...props} />;
}
