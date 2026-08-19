# Beam component files

This document is the **canonical contract** for structuring React component source files in Beam. It applies to **`src/components/`**, **`src/layouts/`**, **`src/forms/`**, **`src/inputs/`**, and similar `*.tsx` modules that export a primary component.

## File order

Top to bottom:

1. **Imports**
2. **Component props** — `type` definitions for the component’s public API (e.g. `ButtonProps`)
3. **Component implementation** — the exported component (and co-located Provider/hook exports when the file owns a small context)
4. **Module-level functions, variables, and types** — private helpers, constants, and supplementary exported types (e.g. `ButtonSize`)

Put **only** prop/API types above the component. Everything else belongs below so the primary export is easy to find.

Shared types used outside the folder live in a dedicated `types.ts` (see [`AGENTS.md`](../AGENTS.md) → Imports) — do not re-export them through the component file.

## Example

```tsx
import { Css } from "src/Css";

type ButtonProps = {
  label: string;
  onClick: VoidFunction;
  size?: ButtonSize;
};

export function Button(props: ButtonProps) {
  const { label, onClick, size = "sm" } = props;
  const buttonStyles = getButtonStyles(size);
  return (
    <button css={buttonStyles} onClick={onClick}>
      {label}
    </button>
  );
}

function getButtonStyles(size: ButtonSize) {
  return sizeStyles[size];
}

const sizeStyles: Record<ButtonSize, object> = {
  sm: Css.px2.$,
  md: Css.px3.$,
  lg: Css.px4.$,
};

export type ButtonSize = "sm" | "md" | "lg";
```

## Related conventions

- **Utility modules** (camelCase `*.ts`, not component files): types → primary export → helpers. See [`AGENTS.md`](../AGENTS.md) → Utility modules.
- **Tests:** helpers after `describe` blocks. **Stories:** helpers after story exports. See [`AGENTS.md`](../AGENTS.md).
