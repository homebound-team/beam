import { Meta } from "@storybook/react";
import { Button, Css } from "src";
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
} as Meta;

/**
 * This component shows how a parent component (this one) can initiate the
 * render of the SuperDrawer with a chosen component (so it can give it the
 * appropriate props) and the unmount can be controlled via the chosen component.
 */
export function Basic() {
  const { setContent } = useSuperDrawer();

  return (
    <>
      <h1>SuperDrawer</h1>
      <Button
        label="Show SuperDrawer"
        onClick={() =>
          setContent({
            title: "Content Title",
            content: <SuperDrawerExampleContent />,
          })
        }
      />
    </>
  );
}

// type Data = { title: string; titleDescription: string; author: string; authorDescription: string };
// type Row = SimpleHeaderAndDataOf<Data>;

// // Faux DB
// const Books = [
//   {
//     title: "Atomic Habits",
//     titleDescription:
//       "A revolutionary system to get 1 per cent better every day. People think when you want to change your life, you need to think big. But world-renowned habits expert James Clear has discovered another way. He knows that real change comes from the compound effect of hundreds of small decisions - doing two push-ups a day, waking up five minutes earlier, or reading just one more page. He calls them atomic habits.",
//     author: "James Clear",
//     authorDescription:
//       "James Clear's work has appeared in the New York Times, Time, and Entrepreneur, and on CBS This Morning, and is taught in colleges around the world. His website, jamesclear.com, receives millions of visitors each month, and hundreds of thousands subscribe to his email newsletter. He is the creator of The Habits Academy, the premier training platform for organizations and individuals that are interested in building better habits in life and work. ",
//   },
//   {
//     title: "Show Your Work!",
//     titleDescription:
//       "In his New York Times bestseller Steal Like an Artist, Austin Kleon showed readers how to unlock their creativity by “stealing” from the community of other movers and shakers. Now, in an even more forward-thinking and necessary book, he shows how to take that critical next step on a creative journey—getting known. Show Your Work! is about why generosity trumps genius. It’s about getting findable, about using the network instead of wasting time “networking.” It’s not self-promotion, it’s self-discovery—let others into your process, then let them steal from you. Filled with illustrations, quotes, stories, and examples, Show Your Work! offers ten transformative rules for being open, generous, brave, productive.",
//     author: "Austin Kleon",
//     authorDescription:
//       "Austin Kleon is a writer who draws. He is the author of the New York Times bestsellers Steal Like an Artist and Show Your Work! His work has been featured on NPR’s Morning Edition, PBS Newshour, and in the New York Times and Wall Street Journal. He also speaks frequently about creativity in the digital age for such organizations as Pixar, Google, SXSW, TEDx, and The Economist. He lives in Austin, Texas, and online at austinkleon.com.",
//   },
//   {
//     title: "The First Cell",
//     titleDescription:
//       "In The First Cell, Azra Raza offers a searing account of how both medicine and our society (mis)treats cancer, how we can do better, and why we must. A lyrical journey from hope to despair and back again, The First Cell explores cancer from every angle: medical, scientific, cultural, and personal. Indeed, Raza describes how she bore the terrible burden of being her own husband's oncologist as he succumbed to leukemia. Like When Breath Becomes Air, The First Cell is no ordinary book of medicine, but a book of wisdom and grace by an author who has devoted her life to making the unbearable easier to bear.",
//     author: "Azra Raza",
//     authorDescription:
//       "Azra Raza is the Chan Soon-Shiong professor of medicine and the director of the MDS Center at Columbia University. In addition to publishing widely in basic and clinical cancer research, Raza is also the coeditor of the highly acclaimed website 3QuarksDaily.com. She lives in New York City.",
//   },
// ];

// export function WithTable() {
//   const { setContent } = useSuperDrawer();

//   // GridTable setup
//   const titleColumn: GridColumn<Row> = { header: "Title", data: ({ title }) => title };
//   const authorColumn: GridColumn<Row> = { header: "Author", data: ({ author }) => author };
//   const rowStyles: GridRowStyles<Row> = {
//     // Example of triggering the drawer when clicking on a row
//     data: {
//       indent: "2",
//       onClick: (row) => setContent(<SuperDrawerExampleContent />),
//     },
//     header: {},
//   };

//   return (
//     <div>
//       <h1 css={Css.xl3Em.mb5.$}>Books</h1>
//       <p css={Css.base.mb3.$}>List of books from various authors</p>
//       <GridTable<Row> as="table" columns={[titleColumn, authorColumn]} rowStyles={rowStyles} rows={Books} />
//       <SuperDrawerComponent
//         open={!!DrawerContent}
//         title="Table Item Header"
//         onCloseClick={handleClose}
//         onSubmitClick={handleSubmit}
//         onChildContentBackClick={() => setChildDrawerContent(null)}
//         childContent={ChildDrawerContent}
//         errorContent={ErrorDrawerContent}
//       >
//         {/* {DrawerContent} */}
//       </SuperDrawerComponent>
//     </div>
//   );
// }

// export function WithChildContent(args: SuperDrawerProps) {
//   const [showChildContent, setShowChildContent] = useState(false);

//   return (
//     <div>
//       <SuperDrawerComponent
//         {...args}
//         childContent={
//           showChildContent && (
//             <div css={Css.hPx(500).bgGray100.df.itemsCenter.justifyCenter.$}>
//               <h1 css={Css.lg.$}>Child Content</h1>
//             </div>
//           )
//         }
//         onChildContentBackClick={() => setShowChildContent(false)}
//       >
//         <SuperDrawerContent onClick={() => setShowChildContent(true)} />
//       </SuperDrawerComponent>
//     </div>
//   );
// }

// export function WithNoNavigation(args: SuperDrawerProps) {
//   return (
//     <SuperDrawerComponent {...args} onPrevClick={undefined} onNextClick={undefined}>
//       <SuperDrawerChildContent />
//     </SuperDrawerComponent>
//   );
// }

// export function WithErrorContent(args: SuperDrawerProps) {
//   return (
//     <SuperDrawerComponent
//       {...args}
//       onPrevClick={undefined}
//       onNextClick={undefined}
//       errorContent={<SuperDrawerErrorContent />}
//     >
//       <SuperDrawerChildContent />
//     </SuperDrawerComponent>
//   );
// }

// export function Example() {
//   // SuperDrawer State
//   const [DrawerContent, setDrawerContent] = useState<ReactNode>(null);
//   const [ChildDrawerContent, setChildDrawerContent] = useState<ReactNode>(null);
//   const [ErrorDrawerContent, setErrorDrawerContent] = useState<ReactNode>(null);

//   // GridTable setup
//   const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
//   const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
//   const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };
//   const rowStyles: GridRowStyles<Row> = {
//     // Example of triggering the drawer when clicking on a row
//     data: {
//       indent: "2",
//       onClick: () =>
//         setDrawerContent(<SuperDrawerContent onClick={() => setChildDrawerContent(<SuperDrawerChildContent />)} />),
//     },
//     header: {},
//   };

//   /** Should validation form and submit before closing the drawer */
//   function handleSubmit() {
//     setDrawerContent(null);
//   }

//   /** Show confirmation component before closing */
//   function handleClose() {
//     setErrorDrawerContent(
//       <SuperDrawerErrorContent
//         onConfirm={() => {
//           // Reset State
//           setDrawerContent(null);
//           setChildDrawerContent(null);
//         }}
//         onCancel={() => setErrorDrawerContent(null)}
//       />,
//     );
//   }

//   return (
//     <div>
//       <h1 css={Css.xl3Em.mb5.$}>Example Page</h1>
//       <h2 css={Css.xlEm.mb1.$}>How to use this page?</h2>
//       <p css={Css.base.mb3.$}>Click on any row of the table below.</p>
//       <GridTable<Row>
//         as="table"
//         columns={[nameColumn, valueColumn, actionColumn]}
//         rowStyles={rowStyles}
//         rows={[
//           { kind: "header", id: "header" },
//           { kind: "data", id: "1", name: "c", value: 1 },
//           { kind: "data", id: "2", name: "b", value: 2 },
//           { kind: "data", id: "3", name: "a", value: 3 },
//         ]}
//       />
//       <SuperDrawerComponent
//         open={!!DrawerContent}
//         title="Table Item Header"
//         onCloseClick={handleClose}
//         onSubmitClick={handleSubmit}
//         onChildContentBackClick={() => setChildDrawerContent(null)}
//         childContent={ChildDrawerContent}
//         errorContent={ErrorDrawerContent}
//       >
//         {/* {DrawerContent} */}
//       </SuperDrawerComponent>
//     </div>
//   );
// }

/** Example component to render inside the SuperDrawer  */
function SuperDrawerExampleContent() {
  const { addChildContent } = useSuperDrawer();
  function handleSubmit() {
    console.log("Submit has been clicked");
  }

  function handleCancel() {
    console.log("Cancel has been clicked");
  }

  return (
    <SuperDrawerContent
      actions={[
        { label: "Cancel", onClick: handleCancel, variant: "tertiary" },
        { label: "Submit", onClick: handleSubmit },
      ]}
    >
      <div css={Css.hPx(500).bgGray100.df.itemsCenter.justifyCenter.$}>
        <p>This is content inside the SuperDrawer</p>
        <Button
          label="Show child content"
          onClick={() =>
            addChildContent({
              title: "Child Content Title",
              // TODO: Here we can pass props!
              content: <SuperDrawerExampleChildContent />,
            })
          }
        />
      </div>
    </SuperDrawerContent>
  );
}

function SuperDrawerExampleChildContent() {
  const { removeChildContent } = useSuperDrawer();

  function handleSubmit() {
    removeChildContent();
  }

  function handleCancel() {
    removeChildContent();
  }

  return (
    <SuperDrawerContent
      actions={[
        { label: "Child Cancel", onClick: handleCancel, variant: "tertiary" },
        { label: "Child Submit", onClick: handleSubmit },
      ]}
      type="childContent"
    >
      <div css={Css.hPx(500).bgGray100.df.itemsCenter.justifyCenter.$}>
        <p>This is child content insider the SuperDrawer</p>
      </div>
    </SuperDrawerContent>
  );
}

/** Example component to render as a child of the SuperDrawer content  */
// const SuperDrawerChildContent = () => (
//   <div css={Css.hPx(500).bgGray100.df.itemsCenter.justifyCenter.$}>
//     <h1 css={Css.lg.$}>Children</h1>
//   </div>
// );

// /** Example component to render as a error/confirmation component of the SuperDrawer content */
// const SuperDrawerErrorContent = ({ onConfirm, onCancel }: { onConfirm?: () => void; onCancel?: () => void }) => (
//   <div css={Css.wPx(400).df.flexColumn.justifyCenter.itemsCenter.tc.$}>
//     <p css={Css.lgEm.$}>Are you sure you want to cancel without saving your changes?</p>
//     <p css={Css.base.mb1.$}>Any changes you've made so far will be lost.</p>
//     <Button label="Continue" onClick={onConfirm} />
//     <Button variant="tertiary" label="Cancel" onClick={onCancel} />
//   </div>
// );
