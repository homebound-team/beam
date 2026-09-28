// The atomic css that the truss vite plugin compiles out of our `Css.*.$` chains.
import { Preview } from "@storybook/react-vite";
import { configure } from "mobx";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";
import "virtual:truss.css";
import { CssReset, Tokens } from "../src";
import { contrastDataTheme } from "../src/components/ContrastScope";
import beamTheme from "./beamTheme";
import "./docs.css";

// formState doesn't use actions
configure({ enforceActions: "never" });

type ColorSchemeGlobal = "light" | "dark";

/** Apply Beam contrast theme for Storybook / Chromatic verification (apps stay light-only). */
function applyStorybookColorScheme(scheme: ColorSchemeGlobal) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (scheme === "dark") {
    root.setAttribute("data-theme", contrastDataTheme);
  } else {
    root.removeAttribute("data-theme");
  }
}

const preview: Preview = {
  parameters: {
    // https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args
    actions: { argTypesRegex: "^on.*" },
    options: {
      // https://storybook.js.org/docs/react/writing-stories/naming-components-and-hierarchy#sorting-stories
      storySort: {
        // Sort by story/docs name too, so docs sharing a title (e.g. Layouts) follow `order`.
        includeNames: true,
        order: [
          "Intro",
          "Layouts",
          [
            "Which layout to use",
            "Routing",
            "Table Page",
            "Form Page",
            "Overview Page",
            "Workflows",
            ["Focused Form", "Stepper"],
          ],
          "Foundations",
          ["Docs", "Primitive Palette", "Color Tokens", "Typography"],
          "Inputs",
          "Components",
          "Forms",
        ],
      },
    },
    // https://storybook.js.org/docs/react/essentials/backgrounds
    backgrounds: {
      options: {
        // Follows --b-surface (white in light, Gray900 under contrast).
        surface: { name: "Surface", value: "var(--b-surface)" },
        light: { name: "light", value: "#F8F8F8" },

        // Default Surface; also useful for off-white hover states
        white: { name: "white", value: `var(${Tokens.Surface})` },

        dark: { name: "dark", value: "rgba(53,53,53,1)" },
      },
    },
    chromatic: {
      // Delaying Chromatic to allow animations to run
      // https://www.chromatic.com/docs/delay#delay-a-story
      delay: 300,
    },
    // Small mobile / Large mobile / Tablet / Desktop. Per-story `chromatic.modes` (via
    // `viewportModes(...)`) reference these keys. This only registers the names — it does not add
    // snapshots; multi-viewport capture stays opt-in per story. No `initialGlobals.viewport`, so
    // non-moded stories are unaffected.
    viewport: { options: MINIMAL_VIEWPORTS },
    controls: {
      // Hide NoControls warning
      // https://storybook.js.org/docs/react/essentials/controls#hide-nocontrols-warning
      hideNoControlsWarning: true,
    },
    docs: { theme: beamTheme },
  },

  globalTypes: {
    colorScheme: {
      description: "Force Beam contrast theme on :root (apps do not follow OS dark mode yet)",
      toolbar: {
        title: "Color scheme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "circlehollow" },
          { value: "dark", title: "Dark (contrast)", icon: "circle" },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const scheme = (context.globals.colorScheme as ColorSchemeGlobal | undefined) ?? "light";
      applyStorybookColorScheme(scheme);
      return (
        <>
          <CssReset />
          <Story />
        </>
      );
    },
  ],

  initialGlobals: {
    backgrounds: {
      value: "surface",
    },
    colorScheme: "light",
  },
};

export default preview;
