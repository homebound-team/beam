import { Meta } from "@storybook/react";
import { useEffect, useRef } from "react";
import {
  Button,
  Css,
  GridColumn,
  GridRowStyles,
  GridTable,
  ModalBody,
  ModalFooter,
  ModalHeader,
  SimpleHeaderAndDataOf,
  Tag,
} from "src";
import { TestModalContent } from "src/components/Modal/TestModalContent";
import { useModal } from "src/components/Modal/useModal";
import { GridDataRow, GridRowLookup, simpleRows } from "src/components/Table";
import { withBeamDecorator, withDimensions } from "src/utils/sb";
import { SuperDrawerContent, useSuperDrawer } from "./index";
import { SuperDrawer as SuperDrawerComponent } from "./SuperDrawer";

export default {
  title: "Components/Super Drawer",
  component: SuperDrawerComponent,
  decorators: [withBeamDecorator, withDimensions()],
} as Meta;

export function Open() {
  const { openInDrawer, isDrawerOpen } = useSuperDrawer();
  function open() {
    openInDrawer({
      title: "Drawer Title",
      content: <TestDrawerContent book={Books[0]} />,
    });
  }
  useEffect(open, [openInDrawer]);
  return (
    // Purposely set height to validate no scrolling behaviour
    <div css={Css.hPx(5000).$}>
      <h1 css={Css.xl3Em.mb1.$}>SuperDrawer Open</h1>
      <Button label={isDrawerOpen ? "SuperDrawer is open" : "Show SuperDrawer"} onClick={open} />
    </div>
  );
}

export function OpenWithNoActions() {
  const { openInDrawer } = useSuperDrawer();
  function open() {
    openInDrawer({
      title: "Drawer Title",
      content: <TestDrawerContent book={Books[0]} hasActions={false} />,
    });
  }
  useEffect(open, [openInDrawer]);
  return (
    <>
      <h1 css={Css.xl3Em.mb1.$}>SuperDrawer Open</h1>
      <Button label="Show SuperDrawer" onClick={open} />
    </>
  );
}

/** Example showing how to add a canClose check after the SuperDrawer is shown */
export function CanCloseDrawerChecks() {
  const { openInDrawer, addCanCloseDrawerCheck } = useSuperDrawer();

  function open() {
    openInDrawer({
      title: "Drawer Title",
      content: <TestDrawerContent book={Books[0]} hasActions={false} />,
    });
    // Add two canClose check to show that all checks are ran
    addCanCloseDrawerCheck(() => true);
    addCanCloseDrawerCheck({
      check: () => false,
      discardText: "Get me outta here!",
      continueText: "Whoops! I didn't mean to do that",
    });
  }

  useEffect(open, [openInDrawer, addCanCloseDrawerCheck]);

  return (
    <>
      <h1 css={Css.xl3Em.mb1.$}>SuperDrawer Open With CanClose Checks</h1>
      <Button label="Show SuperDrawer" onClick={open} />
    </>
  );
}

export function OpenAtDetail() {
  const { openInDrawer, openDrawerDetail } = useSuperDrawer();

  function open() {
    openInDrawer({ title: "Drawer Title", content: <TestDrawerContent book={Books[0]} /> });
    openDrawerDetail({ content: <TestDetailContent book={Books[0]} /> });
  }
  useEffect(open, [openInDrawer, openDrawerDetail]);
  return (
    <>
      <h1 css={Css.xl3Em.mb1.$}>SuperDrawer Open at Detail</h1>
      <Button label="Show SuperDrawer" onClick={open} />
    </>
  );
}

/**
 * Example showing how to add a canClose check for SuperDrawer details. When
 * attempting to close the details page, this actions should trigger a fail
 * canClose check and when trying to close the SuperDrawer this will also
 * trigger a failing check.
 * */
export function CanCloseDrawerDetailsChecks() {
  const { openInDrawer, openDrawerDetail, addCanCloseDrawerCheck, addCanCloseDrawerDetailCheck } = useSuperDrawer();

  function open() {
    openInDrawer({ title: "Drawer Title", content: <TestDrawerContent book={Books[0]} /> });
    openDrawerDetail({ content: <TestDetailContent book={Books[0]} /> });
    // Add failing checks for both drawer and drawer details
    addCanCloseDrawerCheck(() => false);
    addCanCloseDrawerDetailCheck(() => false);
  }

  useEffect(open, [openInDrawer, openDrawerDetail, addCanCloseDrawerCheck, addCanCloseDrawerDetailCheck]);

  return (
    <>
      <h1 css={Css.xl3Em.mb1.$}>SuperDrawer Open at Detail</h1>
      <Button label="Show SuperDrawer" onClick={open} />
    </>
  );
}

export function OpenWithModal() {
  const { openInDrawer } = useSuperDrawer();
  const { openModal } = useModal();
  function open() {
    openInDrawer({ title: "Drawer Title", content: <TestDrawerContent book={Books[0]} /> });
    openModal({ content: <TestModalContent /> });
  }
  useEffect(open, [openInDrawer, openModal]);
  return (
    <>
      <h1 css={Css.xl3Em.mb1.$}>SuperDrawer Open at Modal</h1>
      <Button label="Show SuperDrawer" onClick={open} />
    </>
  );
}

export function OpenWithTitleRightContent() {
  const { openInDrawer } = useSuperDrawer();
  function open() {
    openInDrawer({
      title: "Title",
      content: <TestDrawerContent book={Books[0]} />,
      titleLeftContent: <Tag text={"ASSIGNED"} type={"success"} />,
      titleRightContent: <Button label="Manage RFP" onClick={() => {}} />,
    });
  }
  useEffect(open, [openInDrawer]);
  return (
    <>
      <h1 css={Css.xl3Em.mb1.$}>SuperDrawer Open at Modal</h1>
      <Button label="Show SuperDrawer" onClick={open} />
    </>
  );
}

type Book = { bookTitle: string; bookDescription: string; authorName: string; authorDescription: string };
type Row = SimpleHeaderAndDataOf<Book>;

// Faux DB
const Books: Book[] = [
  {
    bookTitle: "Atomic Habits",
    bookDescription:
      "A revolutionary system to get 1 per cent better every day. People think when you want to change your life, you need to think big. But world-renowned habits expert James Clear has discovered another way. He knows that real change comes from the compound effect of hundreds of small decisions - doing two push-ups a day, waking up five minutes earlier, or reading just one more page. He calls them atomic habits.",
    authorName: "James Clear",
    authorDescription:
      "James Clear's work has appeared in the New York Times, Time, and Entrepreneur, and on CBS This Morning, and is taught in colleges around the world. His website, jamesclear.com, receives millions of visitors each month, and hundreds of thousands subscribe to his email newsletter. He is the creator of The Habits Academy, the premier training platform for organizations and individuals that are interested in building better habits in life and work. ",
  },
  {
    bookTitle: "Show Your Work!",
    bookDescription:
      "In his New York Times bestseller Steal Like an Artist, Austin Kleon showed readers how to unlock their creativity by “stealing” from the community of other movers and shakers. Now, in an even more forward-thinking and necessary book, he shows how to take that critical next step on a creative journey—getting known. Show Your Work! is about why generosity trumps genius. It’s about getting findable, about using the network instead of wasting time “networking.” It’s not self-promotion, it’s self-discovery—let others into your process, then let them steal from you. Filled with illustrations, quotes, stories, and examples, Show Your Work! offers ten transformative rules for being open, generous, brave, productive.",
    authorName: "Austin Kleon",
    authorDescription:
      "Austin Kleon is a writer who draws. He is the author of the New York Times bestsellers Steal Like an Artist and Show Your Work! His work has been featured on NPR’s Morning Edition, PBS Newshour, and in the New York Times and Wall Street Journal. He also speaks frequently about creativity in the digital age for such organizations as Pixar, Google, SXSW, TEDx, and The Economist. He lives in Austin, Texas, and online at austinkleon.com.",
  },
  {
    bookTitle: "The First Cell",
    bookDescription:
      "In The First Cell, Azra Raza offers a searing account of how both medicine and our society (mis)treats cancer, how we can do better, and why we must. A lyrical journey from hope to despair and back again, The First Cell explores cancer from every angle: medical, scientific, cultural, and personal. Indeed, Raza describes how she bore the terrible burden of being her own husband's oncologist as he succumbed to leukemia. Like When Breath Becomes Air, The First Cell is no ordinary book of medicine, but a book of wisdom and grace by an author who has devoted her life to making the unbearable easier to bear.",
    authorName: "Azra Raza",
    authorDescription:
      "Azra Raza is the Chan Soon-Shiong professor of medicine and the director of the MDS Center at Columbia University. In addition to publishing widely in basic and clinical cancer research, Raza is also the coeditor of the highly acclaimed website 3QuarksDaily.com. She lives in New York City.",
  },
];

export function TableWithPrevNextAndCloseCheck() {
  const { openInDrawer, addCanCloseDrawerCheck } = useSuperDrawer();
  const rowLookup = useRef<GridRowLookup<Row>>();
  // Always prompts a confirmation message
  addCanCloseDrawerCheck(() => false);
  // Creates a setContent with prev/next handles to move up or down the table
  function openRow(row: GridDataRow<Row>) {
    if (row.kind === "data") {
      const { prev, next } = rowLookup.current!.lookup(row)["data"];
      openInDrawer({
        title: row.bookTitle,
        onPrevClick: prev && (() => openRow(prev)),
        onNextClick: next && (() => openRow(next)),
        content: <TestDrawerContent book={row} />,
      });
    }
  }

  // GridTable setup
  const titleColumn: GridColumn<Row> = { header: "Title", data: ({ bookTitle }) => bookTitle };
  const authorColumn: GridColumn<Row> = { header: "Author", data: ({ authorName }) => authorName };
  // Example of triggering the drawer when clicking on a row
  const rowStyles: GridRowStyles<Row> = {
    header: {},
    data: { indent: 2, onClick: openRow },
  };

  return (
    <div>
      <h1 css={Css.xl3Em.mb5.$}>Books</h1>
      <p css={Css.base.mb3.$}>List of books from various authors</p>
      <GridTable<Row>
        as="table"
        columns={[titleColumn, authorColumn]}
        rowStyles={rowStyles}
        rowLookup={rowLookup}
        rows={simpleRows(Books.map((book, i) => ({ kind: "data" as const, id: `${i}`, ...book })))}
      />
    </div>
  );
}

/**
 * This component shows how a parent component (this one) can initiate the
 * render of the SuperDrawer with a chosen component (so it can give it the
 * appropriate props) and the unmount can be controlled via the chosen component.
 */
export function TableWithPrevNext() {
  const { openInDrawer } = useSuperDrawer();
  const rowLookup = useRef<GridRowLookup<Row>>();

  // Creates a setContent with prev/next handles to move up or down the table
  function openRow(row: GridDataRow<Row>) {
    if (row.kind === "data") {
      const { prev, next } = rowLookup.current!.lookup(row)["data"];
      openInDrawer({
        title: row.bookTitle,
        onPrevClick: prev && (() => openRow(prev)),
        onNextClick: next && (() => openRow(next)),
        content: <TestDrawerContent book={row} />,
      });
    }
  }

  // GridTable setup
  const titleColumn: GridColumn<Row> = { header: "Title", data: ({ bookTitle }) => bookTitle };
  const authorColumn: GridColumn<Row> = { header: "Author", data: ({ authorName }) => authorName };
  // Example of triggering the drawer when clicking on a row
  const rowStyles: GridRowStyles<Row> = {
    header: {},
    data: { indent: 2, onClick: openRow },
  };

  return (
    <div>
      <h1 css={Css.xl3Em.mb5.$}>Books</h1>
      <p css={Css.base.mb3.$}>List of books from various authors</p>
      <GridTable<Row>
        as="table"
        columns={[titleColumn, authorColumn]}
        rowStyles={rowStyles}
        rowLookup={rowLookup}
        rows={[
          { kind: "header", id: "header" },
          ...Books.map((book, i) => ({ kind: "data" as const, id: `${i}`, ...book })),
        ]}
      />
    </div>
  );
}

interface TestDrawerContentProps {
  book: Book;
  hasActions?: boolean;
}

/** Example component to render inside the SuperDrawer */
function TestDrawerContent({ book, hasActions = true }: TestDrawerContentProps) {
  const { openDrawerDetail, closeDrawer } = useSuperDrawer();
  const { openModal } = useModal();

  function handlePurchase() {
    openModal({ content: <TestSimpleModalContent book={book} onPrimaryClick={closeDrawer} /> });
  }

  return (
    <SuperDrawerContent
      actions={
        hasActions
          ? [
              { label: "Close", onClick: () => closeDrawer(), variant: "tertiary" },
              { label: `Purchase "${book.bookTitle}"`, onClick: handlePurchase },
            ]
          : undefined
      }
    >
      <h2 css={Css.xlEm.mb1.$}>{book.bookTitle}</h2>
      <p css={Css.base.$}>
        <strong>Description:</strong> {book.bookDescription}
      </p>
      <hr css={Css.my1.$} />
      <div css={Css.df.gap1.aic.$}>
        <p>
          <strong>Author:</strong> {book.authorName}
        </p>
        <Button
          variant="tertiary"
          label={`Learn more about ${book.authorName.split(" ")[0]}`}
          onClick={() =>
            openDrawerDetail({
              title: book.authorName,
              content: <TestDetailContent book={book} onPurchase={handlePurchase} />,
            })
          }
        />
      </div>
    </SuperDrawerContent>
  );
}

/** Example component to render inside the SuperDrawer */
function TestDetailContent({ book, onPurchase }: { book: Book; onPurchase?: () => void }) {
  const { closeDrawerDetail } = useSuperDrawer();
  return (
    <SuperDrawerContent
      actions={[
        { label: `Back to "${book.bookTitle}"`, onClick: closeDrawerDetail, variant: "tertiary" },
        { label: `Purchase "${book.bookTitle}"`, onClick: onPurchase, disabled: !onPurchase },
      ]}
    >
      <h2 css={Css.xlEm.mb1.$}>{book.authorName}</h2>
      <p css={Css.base.$}>
        <strong>Description:</strong> {book.authorDescription}
      </p>
    </SuperDrawerContent>
  );
}

/** Example component to render as a error/confirmation component of the SuperDrawer content */
function TestSimpleModalContent({ book, onPrimaryClick }: { book: Book; onPrimaryClick: () => void }) {
  const { closeModal } = useModal();
  return (
    <>
      <ModalHeader>Confirm</ModalHeader>
      <ModalBody>
        <div css={Css.wPx(500).df.fdc.jcc.aic.tc.$}>
          <p css={Css.lgEm.$}>Are you sure you want to purchase {book.bookTitle} ?</p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button label="Purchase" onClick={onPrimaryClick} />
        <Button variant="tertiary" label="Cancel" onClick={() => closeModal()} />
      </ModalFooter>
    </>
  );
}
