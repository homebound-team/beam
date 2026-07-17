# Beam modals (call-site portals)

## Contract

`useModal()` owns a **local** modal host. Imperative `openModal` / `closeModal` are unchanged, but modal content mounts under the **calling component’s React tree** (full caller context). DOM paint still goes through react-aria `OverlayContainer` under Beam’s `OverlayProvider` — not a raw `document.body` portal and not a new React root.

Every component that calls `useModal()` **must** render the returned `portal` in the same function:

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

- `portal` is empty when closed; when open it renders `<Modal />` from this call site.
- Prefer a single return object (`modal.portal`) so lint can tie the hook to the outlet.
- If `portal` is missing, `openModal` is a **no-op** and logs a **dev error**. There is no legacy BeamProvider sibling `<Modal />` fallback.

## What stayed the same

- One modal at a time (a new `openModal` replaces the previous).
- `ModalHeader` / `ModalBody` / `ModalFooter` APIs.
- SuperDrawer remains a BeamProvider-owned host (not call-site portals in v1). Drawer confirm dialogs use an internal host under `OverlayProvider`.

## Migration

Run the codemod to add `{modal.portal}` at existing call sites:

```bash
# from the consumer repo (e.g. internal-frontend), with beam as a sibling:
npx jscodeshift -t ../beam/codemods/add-use-modal-portal.ts src --extensions=tsx,ts,jsx,js --parser=tsx
```

Then fix any remaining sites flagged by the `@homebound` ESLint `useModal` portal-outlet rule (once published).
