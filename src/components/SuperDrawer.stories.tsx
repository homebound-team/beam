import { Meta } from "@storybook/react";
import { useEffect } from "react";
import { Button, Css, GridColumn, GridRowStyles, GridTable, SimpleHeaderAndDataOf } from "src";
import {
  SuperDrawer as SuperDrawerComponent,
  SuperDrawerContent,
  SuperDrawerProvider,
  useSuperDrawer,
} from "./SuperDrawer";

/** Wraps SuperDrawer story with the SuperDrawer context provider */
const withSuperDrawer = (Story: () => JSX.Element) => (
  <SuperDrawerProvider>
    <Story />
  </SuperDrawerProvider>
);

export default {
  title: "Components / Super Drawer",
  component: SuperDrawerComponent,
  decorators: [withSuperDrawer],
  parameters: {
    chromatic: {
      delay: 1000,
    },
  },
} as Meta;

export function Open() {
  const { setContent } = useSuperDrawer();

  // Open the SuperDrawer on render
  useEffect(() => {
    setContent({
      title: "Content Title",
      content: <SuperDrawerExampleContent book={Books[0]} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div css={{ button: Css.m0.$ }}>
      <h1>SuperDrawer Open</h1>
      <Button
        label="Show SuperDrawer"
        onClick={() =>
          setContent({
            title: "Content Title",
            content: <SuperDrawerExampleContent book={Books[0]} />,
          })
        }
      />
    </div>
  );
}

export function OpenWithChild() {
  const { setContent, addChildContent } = useSuperDrawer();

  // Open the SuperDrawer on render
  useEffect(() => {
    setContent({
      title: "Content Title",
      content: <SuperDrawerExampleContent book={Books[0]} />,
    });
    addChildContent({
      title: "Child Content Title",
      content: <SuperDrawerExampleChildContent book={Books[0]} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div css={{ button: Css.m0.$ }}>
      <h1>SuperDrawer Open</h1>
      <Button
        label="Show SuperDrawer"
        onClick={() =>
          setContent({
            title: "Content Title",
            content: <SuperDrawerExampleContent book={Books[0]} />,
          })
        }
      />
    </div>
  );
}

type Book = { title: string; titleDescription: string; author: string; authorDescription: string };
type Row = SimpleHeaderAndDataOf<Book>;

// Faux DB
const Books = [
  {
    title: "Atomic Habits",
    titleDescription:
      "A revolutionary system to get 1 per cent better every day. People think when you want to change your life, you need to think big. But world-renowned habits expert James Clear has discovered another way. He knows that real change comes from the compound effect of hundreds of small decisions - doing two push-ups a day, waking up five minutes earlier, or reading just one more page. He calls them atomic habits.",
    author: "James Clear",
    authorDescription:
      "James Clear's work has appeared in the New York Times, Time, and Entrepreneur, and on CBS This Morning, and is taught in colleges around the world. His website, jamesclear.com, receives millions of visitors each month, and hundreds of thousands subscribe to his email newsletter. He is the creator of The Habits Academy, the premier training platform for organizations and individuals that are interested in building better habits in life and work. ",
  },
  {
    title: "Show Your Work!",
    titleDescription:
      "In his New York Times bestseller Steal Like an Artist, Austin Kleon showed readers how to unlock their creativity by “stealing” from the community of other movers and shakers. Now, in an even more forward-thinking and necessary book, he shows how to take that critical next step on a creative journey—getting known. Show Your Work! is about why generosity trumps genius. It’s about getting findable, about using the network instead of wasting time “networking.” It’s not self-promotion, it’s self-discovery—let others into your process, then let them steal from you. Filled with illustrations, quotes, stories, and examples, Show Your Work! offers ten transformative rules for being open, generous, brave, productive.",
    author: "Austin Kleon",
    authorDescription:
      "Austin Kleon is a writer who draws. He is the author of the New York Times bestsellers Steal Like an Artist and Show Your Work! His work has been featured on NPR’s Morning Edition, PBS Newshour, and in the New York Times and Wall Street Journal. He also speaks frequently about creativity in the digital age for such organizations as Pixar, Google, SXSW, TEDx, and The Economist. He lives in Austin, Texas, and online at austinkleon.com.",
  },
  {
    title: "The First Cell",
    titleDescription:
      "In The First Cell, Azra Raza offers a searing account of how both medicine and our society (mis)treats cancer, how we can do better, and why we must. A lyrical journey from hope to despair and back again, The First Cell explores cancer from every angle: medical, scientific, cultural, and personal. Indeed, Raza describes how she bore the terrible burden of being her own husband's oncologist as he succumbed to leukemia. Like When Breath Becomes Air, The First Cell is no ordinary book of medicine, but a book of wisdom and grace by an author who has devoted her life to making the unbearable easier to bear.",
    author: "Azra Raza",
    authorDescription:
      "Azra Raza is the Chan Soon-Shiong professor of medicine and the director of the MDS Center at Columbia University. In addition to publishing widely in basic and clinical cancer research, Raza is also the coeditor of the highly acclaimed website 3QuarksDaily.com. She lives in New York City.",
  },
];

/**
 * This component shows how a parent component (this one) can initiate the
 * render of the SuperDrawer with a chosen component (so it can give it the
 * appropriate props) and the unmount can be controlled via the chosen component.
 */
export function WithTable() {
  const { setContent } = useSuperDrawer();

  // Recursive function to move up or down the table
  function handleRoute(currentBook: Book, type: "prev" | "next") {
    // Find previous book
    let index = Books.findIndex((_book) => _book.title === currentBook.title);
    const book = type === "prev" ? Books[(--index + Books.length) % Books.length] : Books[++index % Books.length];

    setContent({
      title: book.title,
      onPrevClick: () => handleRoute(book, "prev"),
      onNextClick: () => handleRoute(book, "next"),
      content: <SuperDrawerExampleContent book={book} />,
    });
  }

  // GridTable setup
  const titleColumn: GridColumn<Row> = { header: "Title", data: ({ title }) => title };
  const authorColumn: GridColumn<Row> = { header: "Author", data: ({ author }) => author };
  const rowStyles: GridRowStyles<Row> = {
    // Example of triggering the drawer when clicking on a row
    data: {
      indent: "2",
      onClick: ({ kind, ...book }) =>
        setContent({
          title: book.title,
          onPrevClick: () => handleRoute(book, "prev"),
          onNextClick: () => handleRoute(book, "next"),
          content: <SuperDrawerExampleContent book={book} />,
        }),
    },
    header: {},
  };

  return (
    <div>
      <h1 css={Css.xl3Em.mb5.$}>Books</h1>
      <p css={Css.base.mb3.$}>List of books from various authors</p>
      <GridTable<Row>
        as="table"
        columns={[titleColumn, authorColumn]}
        rowStyles={rowStyles}
        rows={[
          { kind: "header", id: "header" },
          ...Books.map((book, i) => ({ kind: "data" as const, id: `${i}`, ...book })),
        ]}
      />
    </div>
  );
}

/** Example component to render inside the SuperDrawer */
function SuperDrawerExampleContent({ book }: { book: Book }) {
  const { addChildContent, removeContent, setErrorContent } = useSuperDrawer();

  function handleBookPurchase() {
    // Process payment...
    handleClose();
  }

  function handlePurchase() {
    setErrorContent({ content: <SuperDrawerExampleErrorContent book={book} onPrimaryClick={handleBookPurchase} /> });
  }

  function handleClose() {
    removeContent();
  }

  return (
    <SuperDrawerContent
      actions={[
        { label: "Close", onClick: handleClose, variant: "tertiary" },
        { label: "Purchase Book", onClick: handlePurchase },
      ]}
    >
      <h2 css={Css.xlEm.mb1.$}>{book.title}</h2>
      <p css={Css.base.$}>
        <strong>Description:</strong> {book.titleDescription}
      </p>
      <hr css={Css.my1.$} />
      <div css={Css.df.gap1.itemsCenter.$}>
        <p>
          <strong>Author:</strong> {book.author}
        </p>
        <div css={{ button: Css.m0.$ }}>
          <Button
            variant="tertiary"
            label={`Learn more about ${book.author.split(" ")[0]}`}
            onClick={() =>
              addChildContent({
                title: book.author,
                content: <SuperDrawerExampleChildContent book={book} onPurchase={handlePurchase} />,
              })
            }
          />
        </div>
      </div>
    </SuperDrawerContent>
  );
}

/** Example component to render inside the SuperDrawer */
function SuperDrawerExampleChildContent({ book, onPurchase }: { book: Book; onPurchase?: () => void }) {
  const { removeChildContent } = useSuperDrawer();

  function handleCancel() {
    removeChildContent();
  }

  return (
    <SuperDrawerContent
      actions={[
        { label: `Back to ${book.title}`, onClick: handleCancel, variant: "tertiary" },
        { label: `Purchase ${book.title}`, onClick: onPurchase, disabled: !onPurchase },
      ]}
      type="childContent"
    >
      <h2 css={Css.xlEm.mb1.$}>{book.author}</h2>
      <p css={Css.base.$}>
        <strong>Description:</strong> {book.authorDescription}
      </p>
    </SuperDrawerContent>
  );
}

/** Example component to render as a error/confirmation component of the SuperDrawer content */
const SuperDrawerExampleErrorContent = ({ book, onPrimaryClick }: { book: Book; onPrimaryClick: () => void }) => {
  const { removeErrorContent } = useSuperDrawer();

  return (
    <div css={Css.wPx(500).df.flexColumn.justifyCenter.itemsCenter.tc.$}>
      <p css={Css.lgEm.$}>Are you sure you want to purchase {book.title} ?</p>
      <div css={Css.gap1.$}>
        <Button label="Purchase" onClick={onPrimaryClick} />
        <Button variant="tertiary" label="Cancel" onClick={() => removeErrorContent()} />
      </div>
    </div>
  );
};
