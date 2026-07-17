# Beam modals

## Overview

`useModal()` provides an imperative API (`openModal`, `closeModal`, and related helpers) for opening a modal whose content mounts in the **calling component’s React tree**. That means modal content inherits the same React context as the caller.

Visually, the modal paints through react-aria’s `OverlayContainer` under Beam’s `OverlayProvider` — not via a raw `document.body` portal or a separate React root.

## Usage

Every component that calls `useModal()` must render the returned `portal` in the same function:

```tsx
function MyPage() {
  const modal = useModal();

  return (
    <>
      <Button label="Edit" onClick={() => modal.openModal({ content: <EditForm /> })} />
      {modal.portal}
    </>
  );
}
```

- `portal` is empty when the modal is closed; when open, it renders `<Modal />` from this call site.
- Prefer keeping the hook result as a single object (`modal.portal`) so lint can associate the hook with the outlet.
- If `portal` is not rendered, `openModal` is a no-op and logs a development error.

## Behavior

- Only one modal is open at a time; a new `openModal` replaces the previous modal.
- Use `ModalHeader`, `ModalBody`, and `ModalFooter` for consistent modal layout.
- SuperDrawer is hosted by `BeamProvider` (not call-site portals). Confirm dialogs opened from the drawer use an internal host under `OverlayProvider`.

## Adding outlets at existing call sites

To insert `{modal.portal}` (or equivalent) at call sites that already use `useModal()`:

```bash
# from the consumer repo (e.g. internal-frontend), with beam as a sibling:
npx jscodeshift -t ../beam/codemods/add-use-modal-portal.ts src --extensions=tsx,ts,jsx,js --parser=tsx
```

The `@homebound/require-use-modal-portal` ESLint rule flags call sites that omit the outlet.
