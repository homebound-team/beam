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
export function Open() {
  const { setContent } = useSuperDrawer();

  return (
    <>
      <h1>SuperDrawer</h1>
      <Button
        label="Show SuperDrawer"
        onClick={() =>
          setContent({
            title: "Content Title",
            // TODO: Here we can pass props!
            content: <SuperDrawerExampleContent />,
          })
        }
      />
    </>
  );
}

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
        { label: "Cancel", onClick: handleCancel, variant: "tertiary" },
        { label: "Submit", onClick: handleSubmit },
      ]}
    >
      <div css={Css.hPx(500).bgGray100.df.itemsCenter.justifyCenter.$}>
        <p>This is child content insider the SuperDrawer</p>
      </div>
    </SuperDrawerContent>
  );
}

// const SuperDrawerContent = ({ onClick }: { onClick?: () => void }) => (
//   <div css={Css.hPx(500).bgGray100.df.itemsCenter.justifyCenter.$}>
//     <div css={Css.df.flexColumn.itemsCenter.$}>
//       <h1 css={Css.lg.$}>Children</h1>
//       <Button onClick={onClick} label="Show Child Content"></Button>
//     </div>
//   </div>
// );

/** Example component to render as a child of the SuperDrawer content  */
const SuperDrawerChildContent = () => (
  <div css={Css.hPx(500).bgGray100.df.itemsCenter.justifyCenter.$}>
    <h1 css={Css.lg.$}>Children</h1>
  </div>
);

/** Example component to render as a error/confirmation component of the SuperDrawer content */
const SuperDrawerErrorContent = ({ onConfirm, onCancel }: { onConfirm?: () => void; onCancel?: () => void }) => (
  <div css={Css.wPx(400).df.flexColumn.justifyCenter.itemsCenter.tc.$}>
    <p css={Css.lgEm.$}>Are you sure you want to cancel without saving your changes?</p>
    <p css={Css.base.mb1.$}>Any changes you've made so far will be lost.</p>
    <Button label="Continue" onClick={onConfirm} />
    <Button variant="tertiary" label="Cancel" onClick={onCancel} />
  </div>
);
