import { type ObjectConfig, useFormState } from "@homebound/form-state";
import type { Meta } from "@storybook/react-vite";
import { isValidElement, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "src/components/Button";
import { GridTableLayout } from "src/components/Layout/GridTableLayout/GridTableLayout";
import { RightPanePanel } from "src/components/Layout/RightPaneLayout/RightPanePanel";
import { rightPaneContentStore } from "src/components/Layout/RightPaneLayout/rightPaneStore";
import { useRightPaneActions } from "src/components/Layout/RightPaneLayout/useRightPane";
import type { PageBannerProps } from "src/components/StatusBanner/StatusBanner";
import { useGridTableApi } from "src/components/Table/GridTableApi";
import { column, selectColumn } from "src/components/Table/utils/columns";
import { simpleHeader, type SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { TabContent, type TabWithContent } from "src/components/Tabs";
import { Css, Tokens } from "src/Css";
import { BoundSelectField } from "src/forms/BoundSelectField";
import { useComputed } from "src/hooks/useComputed";
import { SelectField } from "src/inputs/SelectField";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { pageContentPaddingX } from "src/layouts/layoutSpacing";
import { NavbarLayout } from "src/layouts/NavbarLayout/NavbarLayout";
import { usePageBanner } from "src/layouts/PageBanner/usePageBanner";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { noop } from "src/utils/helpers";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { createNavbar, GridTableLayoutExample, SideNavBrand, sideNavItems } from "src/utils/sbComponents";

export default {
  title: "Layouts/Table Page",
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} satisfies Meta;

/**
 * Env banner → navbar → side nav → page header → `GridTableLayout`.
 * Click a row or **Open right pane** to open the document-scroll pane.
 */
export function WithSideNav() {
  return (
    <TablePageChrome withSideNav>
      <GridTableLayoutExample storageKey="layouts-table-page-side-nav" withRightPane />
    </TablePageChrome>
  );
}

/** Same table page without a side nav — the page header spans from the viewport left edge. */
export function WithoutSideNav() {
  return (
    <TablePageChrome>
      <GridTableLayoutExample storageKey="layouts-table-page" withRightPane />
    </TablePageChrome>
  );
}

/** Stay-pinned page banner under the header. It stays put when the page header auto-hides. */
export function WithBanner() {
  return (
    <TablePageChrome
      withSideNav
      banner={{
        type: "update",
        title: "Calculating Updated Costs",
        description: "Costs shown may be out of date.",
        secondaryAction: { label: "View Details", onClick: noop },
      }}
    >
      <GridTableLayoutExample storageKey="layouts-table-page-banner" withRightPane />
    </TablePageChrome>
  );
}

/** A tab pins its own banner with `usePageBanner`; switching tabs clears it. */
export function WithTabBanner() {
  const [selected, setSelected] = useState<PageTab>("lineItems");
  const tabs = useMemo(() => pageTabs({ lineItemsBanner: true }), []);

  return (
    <TablePageChrome withSideNav tabs={{ tabs, selected, onChange: setSelected }}>
      <TabContent tabs={tabs} selected={selected} />
    </TablePageChrome>
  );
}

/** Same chrome, with header tabs. The table's actions own the top gap; Overview uses the tab panel's. */
export function WithTabs() {
  const [selected, setSelected] = useState<PageTab>("lineItems");
  const tabs = useMemo(() => pageTabs(), []);

  return (
    <TablePageChrome withSideNav tabs={{ tabs, selected, onChange: setSelected }}>
      <TabContent tabs={tabs} selected={selected} />
    </TablePageChrome>
  );
}

/**
 * `RightPanePanel`'s `isDirty` guard: click a book to edit it, or check books to bulk edit them. With edits, closing or
 * switching panels asks first; checking more books mid bulk edit (same key) and Delete, which reverts first, don't.
 */
export function UnsavedChangesGuard() {
  const [books, setBooks] = useState(createBooks);
  const api = useGridTableApi<BookTableRow>();
  const selectedIds = useComputed(() => api.getSelectedRowIds("data"), [api]);
  const { openRightPane, closeRightPane } = useRightPaneActions();
  const columns = useMemo(() => createBookColumns(), []);
  const rows = useMemo(
    () => [simpleHeader, ...books.map((b) => ({ kind: "data" as const, id: b.id, data: b }))],
    [books],
  );

  const saveBooks = useCallback((ids: string[], changes: BookChanges) => {
    setBooks((prev) => prev.map((b) => (ids.includes(b.id) ? { ...b, ...changes } : b)));
  }, []);
  const deleteBook = useCallback((id: string) => setBooks((prev) => prev.filter((b) => b.id !== id)), []);

  // One stable key, so checking more books updates the open Bulk Edit panel in place
  useEffect(() => {
    if (selectedIds.length > 0) {
      openRightPane({ content: <BulkEditBooksPanel key="bulk" ids={selectedIds} onSave={saveBooks} /> });
    } else if (isBulkEditPanel(rightPaneContentStore.getSnapshot())) {
      // A snapshot, not a dep: as a dep, opening a book while books are checked would reopen Bulk Edit
      closeRightPane();
    }
  }, [selectedIds, openRightPane, closeRightPane, saveBooks]);

  return (
    <TablePageChrome title="Books">
      <GridTableLayout
        withRightPane
        hideEditColumns
        tableProps={{
          api,
          columns,
          rows,
          rowStyles: {
            data: {
              onClick: (row) =>
                openRightPane({
                  content: <BookPanel key={row.id} book={row.data} onSave={saveBooks} onDelete={deleteBook} />,
                }),
            },
          },
        }}
      />
    </TablePageChrome>
  );
}
UnsavedChangesGuard.parameters = { chromatic: { disableSnapshot: true } };

function TablePageChrome({
  title = "Projects",
  withSideNav,
  tabs,
  banner,
  children,
}: {
  title?: string;
  withSideNav?: boolean;
  tabs?: { tabs: TabWithContent<PageTab>[]; selected: PageTab; onChange: (value: PageTab) => void };
  banner?: PageBannerProps;
  children: ReactNode;
}) {
  const body = (
    <PageHeaderLayout
      pageHeader={{ title, rightSlot: <OpenRightPaneButton title="Row detail" />, ...(tabs && { tabs }) }}
      banner={banner}
    >
      {children}
    </PageHeaderLayout>
  );
  return (
    <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>
      <NavbarLayout navbar={createNavbar()}>
        {withSideNav ? (
          <SideNavLayout sideNav={{ top: <SideNavBrand />, items: sideNavItems() }}>{body}</SideNavLayout>
        ) : (
          body
        )}
      </NavbarLayout>
    </EnvironmentBannerLayout>
  );
}

type PageTab = "lineItems" | "overview";

function pageTabs({ lineItemsBanner = false } = {}): TabWithContent<PageTab>[] {
  return [
    {
      name: "Line items",
      value: "lineItems",
      render: () =>
        lineItemsBanner ? (
          <LineItemsTabWithBanner />
        ) : (
          <GridTableLayoutExample storageKey="layouts-table-page-tabs" withRightPane />
        ),
    },
    {
      name: "Overview",
      value: "overview",
      render: () => (
        <div css={{ ...pageContentPaddingX, ...Css.pb2.$ }}>
          <p>Overview content sits below the tabs with the tab panel's own top gap.</p>
        </div>
      ),
    },
  ];
}

function LineItemsTabWithBanner() {
  // Stands in for a tab's query result deciding whether it needs a banner.
  const [costsStale, setCostsStale] = useState(true);
  const banner = useMemo<PageBannerProps | undefined>(
    () =>
      costsStale
        ? {
            type: "update",
            title: "Updated Costs Ready",
            description: "Updated calculations are ready for 632 configurations.",
            secondaryAction: { label: "View Details", onClick: noop },
            primaryAction: { label: "Update Costs", onClick: () => setCostsStale(false) },
          }
        : undefined,
    [costsStale],
  );
  usePageBanner(banner);
  return <GridTableLayoutExample storageKey="layouts-table-page-tab-banner" withRightPane />;
}

function OpenRightPaneButton({ title }: { title: string }) {
  const { openRightPane } = useRightPaneActions();
  return (
    <Button
      label="Open right pane"
      variant="secondary"
      onClick={() =>
        openRightPane({
          content: (
            <RightPanePanel title={title}>
              <p css={Css.sm.color(Tokens.OnSurfaceMuted).$}>
                Document-scroll pane. Click a table row or this action to open it; close from the pane header.
              </p>
            </RightPanePanel>
          ),
        })
      }
    />
  );
}

type Format = "Hardcover" | "Paperback";
type Status = "Draft" | "Published";
type Book = { id: string; title: string; author: string; format: Format; status: Status };
type BookChanges = Partial<Pick<Book, "format" | "status">>;
type BookForm = { format?: Format | null; status?: Status | null };
type BookTableRow = SimpleHeaderAndData<Book>;

function BookPanel(props: {
  book: Book;
  onSave: (ids: string[], changes: BookChanges) => void;
  onDelete: (id: string) => void;
}) {
  const { book, onSave, onDelete } = props;
  const { closeRightPane } = useRightPaneActions();
  const formState = useFormState({ config: bookConfig, init: { input: book, map: toBookForm } });
  const isDirty = useComputed(() => formState.dirty, [formState]);
  return (
    <RightPanePanel
      title={book.title}
      isDirty={() => formState.dirty}
      deleteAction={{
        onClick: () => {
          onDelete(book.id);
          // The book is gone, so drop its edits instead of asking to discard them
          formState.revertChanges();
          closeRightPane();
        },
      }}
      secondaryAction={{ label: "Cancel", onClick: closeRightPane }}
      primaryAction={{
        label: "Save",
        disabled: !isDirty,
        onClick: () => {
          const changes = {
            format: formState.format.value ?? book.format,
            status: formState.status.value ?? book.status,
          };
          onSave([book.id], changes);
          formState.update({ ...book, ...changes });
        },
      }}
    >
      <div css={Css.df.fdc.gap3.$}>
        <BoundSelectField field={formState.format} options={toOptions<Format>(["Hardcover", "Paperback"])} />
        <BoundSelectField field={formState.status} options={toOptions<Status>(["Draft", "Published"])} />
      </div>
    </RightPanePanel>
  );
}

function BulkEditBooksPanel(props: { ids: string[]; onSave: (ids: string[], changes: BookChanges) => void }) {
  const { ids, onSave } = props;
  const { closeRightPane } = useRightPaneActions();
  const [draft, setDraft] = useState<BookChanges>({});
  const isDirty = !!draft.format || !!draft.status;
  return (
    <RightPanePanel
      title={`Bulk Edit (${ids.length})`}
      isDirty={() => isDirty}
      secondaryAction={{ label: "Cancel", onClick: () => closeRightPane() }}
      primaryAction={{
        label: "Save",
        disabled: !isDirty,
        onClick: () => {
          onSave(ids, draft);
          setDraft({});
        },
      }}
    >
      <BookFields changes={draft} onChange={setDraft} />
    </RightPanePanel>
  );
}

function isBulkEditPanel(content: ReactNode): boolean {
  return isValidElement(content) && content.type === BulkEditBooksPanel;
}

function BookFields(props: { changes: BookChanges; onChange: (changes: BookChanges) => void }) {
  const { changes, onChange } = props;
  return (
    <div css={Css.df.fdc.gap3.$}>
      <SelectField
        label="Format"
        value={changes.format}
        options={toOptions<Format>(["Hardcover", "Paperback"])}
        onSelect={(format) => onChange({ ...changes, format })}
      />
      <SelectField
        label="Status"
        value={changes.status}
        options={toOptions<Status>(["Draft", "Published"])}
        onSelect={(status) => onChange({ ...changes, status })}
      />
    </div>
  );
}

function createBookColumns() {
  return [
    selectColumn<BookTableRow>(),
    column<BookTableRow>({ header: "Title", data: (b) => b.title }),
    column<BookTableRow>({ header: "Author", data: (b) => b.author }),
    column<BookTableRow>({ header: "Format", data: (b) => b.format }),
    column<BookTableRow>({ header: "Status", data: (b) => b.status }),
  ];
}

function createBooks(): Book[] {
  return [
    {
      id: "b:1",
      title: "The Left Hand of Darkness",
      author: "Ursula K. Le Guin",
      format: "Paperback",
      status: "Published",
    },
    { id: "b:2", title: "The Dispossessed", author: "Ursula K. Le Guin", format: "Hardcover", status: "Published" },
    { id: "b:3", title: "Kindred", author: "Octavia E. Butler", format: "Paperback", status: "Published" },
    { id: "b:4", title: "Parable of the Sower", author: "Octavia E. Butler", format: "Hardcover", status: "Draft" },
    { id: "b:5", title: "Piranesi", author: "Susanna Clarke", format: "Hardcover", status: "Draft" },
    {
      id: "b:6",
      title: "Jonathan Strange & Mr Norrell",
      author: "Susanna Clarke",
      format: "Paperback",
      status: "Draft",
    },
  ];
}

// A const, not a factory: form-state rebuilds the form when its config changes identity
const bookConfig: ObjectConfig<BookForm> = { format: { type: "value" }, status: { type: "value" } };

function toBookForm(book: Book): BookForm {
  return { format: book.format, status: book.status };
}

function toOptions<V extends string>(values: V[]): { id: V; name: V }[] {
  return values.map((v) => ({ id: v, name: v }));
}
