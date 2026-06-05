# Conditional action column disappearing

## What people saw

A table renders an action column (like a trash icon) only in edit mode, and adds it
to the `columns` array conditionally:

```tsx
const columns = [
  column({ id: "name", ... }),
  column({ id: "amount", ... }),
  ...(editing ? [actionColumn({ id: "action", ... })] : []),
];
```

This works at first. But after toggling between read and edit a few times and then
coming back to the table (for example navigating away and back, or anything that
re-mounts the table), the action column would sometimes not show up in edit mode,
even though `columns` clearly contained it.

## Why it happened

The table remembers which columns are visible in `sessionStorage` so a user's
show/hide choices stick. The storage key is built from the list of column ids, so
the key is different in each mode:

- read mode: `nameAmount`
- edit mode: `nameAmountAction`

Every time the columns change, the table sets up a small watcher (a MobX `autorun`)
that writes the current set of visible columns to that mode's storage key. The
problem was that these watchers were never torn down. So once you had entered edit
mode, the watcher tied to the `nameAmountAction` key kept running forever — even
after you switched back to read mode.

In read mode the action column is no longer in the table, so the visible set is just
`["name", "amount"]`. The leftover watcher then wrote `["name", "amount"]` into the
`nameAmountAction` key — recording the action column as "not visible" under its own
key, while it simply wasn't on screen.

The damage only became visible on a fresh mount. When the table is built again from
scratch, it reads that storage key to decide what to show. It found
`["name", "amount"]`, concluded the action column had been hidden by the user, and
left it out — so the column disappeared.

## The fix

Each storage key should only ever have one live watcher. `ColumnStorage` now keeps a
reference to the watcher it created and disposes the previous one before starting a
new one. With the stale watcher gone, a mode's storage key is only ever updated while
that mode is actually active, so it stays correct and the action column shows up
every time.
