import { createContext, ReactChild, ReactNode, useContext, useMemo, useState } from "react";
import { SuperDrawer } from "./SuperDrawer";
import { contentStackSymbol } from "./symbols";

interface SuperDrawerHeaderProps {
  /** Title of the SuperDrawer */
  title: string;
  /**
   * Handlers for left and right header button group. Shows disabled state
   * otherwise.
   */
  onPrevClick?: () => void;
  onNextClick?: () => void;
  /**
   * Handler when clicking on the following elements:
   * - `X` icon
   * - Background overlay
   *
   * @default Closes the SuperDrawer by calling `closeDrawer()`
   */
  onClose?: () => void;
}

// When adding a new element to the stack
export interface SuperDrawerNewOpenInDrawerProps extends SuperDrawerHeaderProps {
  content: ReactNode;
  type?: "new";
}

// When adding a detail element to the stack
interface SuperDrawerDetailOpenInDrawerProps extends Partial<Pick<SuperDrawerHeaderProps, "title">> {
  content: ReactNode;
  type: "detail";
}

type SuperDrawerOpenInDrawerProps = SuperDrawerNewOpenInDrawerProps | SuperDrawerDetailOpenInDrawerProps;

// Values used by SuperDrawer for rendering including `SuperDrawerHeaderProps`
interface SuperDrawerContextValues {
  /**
   * Key to access the SuperDrawer content stack
   * @private
   */
  [contentStackSymbol]: SuperDrawerOpenInDrawerProps[];
  isDrawerOpen: boolean;
  modalContent?: ReactNode;
}

// Actions that can be performed to SuperDrawer
export interface SuperDrawerContextActions {
  /**
   * Adds a new element to the SuperDrawer content stack which can be of two types.
   *
   * These types are controlled by the `type` key defined by `SuperDrawerOpenInDrawerProps`:
   * - "new": represents a new element that will erase all other element on the contentStack
   * - "detail": represents a detail element that will be pushed onto contentStack
   *
   * The only difference between `new` and `detail` type are the visual states that SuperDrawer
   * adds to help with navigation. For example, when adding a `detail` element, a "back" button
   * will be injected into the content area to help users navigate back to the `new` content.
   */
  openInDrawer: (content: SuperDrawerOpenInDrawerProps) => void;
  /**
   * Pops and element from the SuperDrawer content stack. If the resulting pop
   * causes the stack to have no more elements, the SuperDrawer will close.
   */
  closeInDrawer: () => void;
  /** Clears the SuperDrawer content stack and closes the drawer */
  closeDrawer: () => void;
  /** Shows the given component as the SuperDrawer modal */
  setModalContent: (content: ReactNode) => void;
  /** Closes the modal */
  closeModal: () => void;
}

interface SuperDrawerContextProps extends SuperDrawerContextActions, SuperDrawerContextValues {}

const SuperDrawerContext = createContext<SuperDrawerContextProps>({} as SuperDrawerContextProps);

export const useSuperDrawer = () => useContext(SuperDrawerContext);

export function SuperDrawerProvider({ children }: { children: ReactChild }) {
  const [contentStack, setContentStack] = useState<SuperDrawerOpenInDrawerProps[]>([]);
  const [modalContent, setModalContent] = useState<ReactNode>(null);

  // Building context object
  const values: SuperDrawerContextValues = {
    [contentStackSymbol]: contentStack,
    modalContent,
    isDrawerOpen: contentStack.length > 0,
  };
  const actions: SuperDrawerContextActions = useMemo(
    () => ({
      openInDrawer: (content) => {
        const { type = "new", title } = content;

        // When type is not given, or "new", reset the contentStack
        if (type === "new") {
          setContentStack([{ ...content, type } as SuperDrawerNewOpenInDrawerProps]);
        }
        // Otherwise push the element onto the stack
        else {
          setContentStack((prev) => {
            if (prev.length === 0) {
              console.error(
                "SuperDrawer must have at least one `new` element before adding a `detail` element. Adding `type` of `new` to `openInDrawer` should resolve the issue.",
              );
              return prev;
            }

            return [
              ...prev,
              {
                ...content,
                // Defaulting optional title to previous elements title
                title: title ?? prev[prev.length - 1].title,
              } as SuperDrawerDetailOpenInDrawerProps,
            ];
          });
        }
      },
      closeInDrawer: () => setContentStack((prev) => prev.slice(0, -1)),
      closeDrawer: () => {
        setContentStack([]);
        setModalContent(null);
      },
      setModalContent: (content) => setModalContent(content),
      closeModal: () => setModalContent(null),
    }),
    [],
  );

  const superDrawerContext: SuperDrawerContextProps = { ...values, ...actions };

  return (
    <SuperDrawerContext.Provider value={superDrawerContext}>
      {children}
      {/* TODO: Use React.createPortal is zIndex becomes an issue */}
      <SuperDrawer />
    </SuperDrawerContext.Provider>
  );
}
