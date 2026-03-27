// Make framer-motion animations happen immediately for easier testing
// https://github.com/framer/motion/issues/285#issuecomment-1252290924
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    AnimatePresence: (props: any) => <div {...props} />,
  };
});

export {};
