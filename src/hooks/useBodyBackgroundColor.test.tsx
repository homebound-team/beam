import { renderHook } from "@testing-library/react";
import { BeamColor } from "src/colors";
import { Palette, Tokens } from "src/Css";
import { useBodyBackgroundColor } from "src/hooks/useBodyBackgroundColor";

describe("useBodyBackgroundColor", () => {
  beforeEach(() => {
    document.body.style.backgroundColor = "";
  });

  it("sets document.body background to a semantic token CSS variable", () => {
    // Given no prior inline body background
    // When the hook registers Tokens.Surface
    renderHook(() => useBodyBackgroundColor(Tokens.Surface));

    // Then document.body uses the surface token variable
    expect(document.body.style.backgroundColor).toBe("var(--b-surface)");
  });

  it("sets document.body background to a palette color", () => {
    // Given no prior inline body background
    // When the hook registers Palette.White
    renderHook(() => useBodyBackgroundColor(Palette.White));

    // Then document.body uses the palette rgba value (browsers normalize rgba to rgb in inline styles)
    expect(document.body.style.backgroundColor).toBe("rgb(255, 255, 255)");
  });

  it("restores the prior inline background color on unmount", () => {
    // Given a known inline body background before mount
    document.body.style.backgroundColor = "rgb(1, 2, 3)";

    // When the hook mounts and then unmounts
    const { unmount } = renderHook(() => useBodyBackgroundColor(Tokens.Surface));
    expect(document.body.style.backgroundColor).toBe("var(--b-surface)");
    unmount();

    // Then the prior inline value is restored
    expect(document.body.style.backgroundColor).toBe("rgb(1, 2, 3)");
  });

  it("updates document.body background when the color changes", () => {
    // Given an initial surface background
    const initialProps: { color: BeamColor } = { color: Tokens.Surface };
    const { rerender } = renderHook(({ color }) => useBodyBackgroundColor(color), { initialProps });
    expect(document.body.style.backgroundColor).toBe("var(--b-surface)");

    // When the color prop changes
    rerender({ color: Palette.Gray100 });

    // Then document.body reflects the new color
    expect(document.body.style.backgroundColor).toBe("rgb(247, 245, 245)");
  });
});
