import { AvatarGroup } from "src/components/Avatar/AvatarGroup";
import { click, render } from "src/utils/rtl";
import { zeroTo } from "src/utils/sb";

describe(AvatarGroup, () => {
  it("renders all 8 avatars when only 8 are provided", async () => {
    const avatars: { src: string | undefined; name?: string }[] = zeroTo(8).map((i) => ({
      src: undefined,
    }));

    const r = await render(<AvatarGroup avatars={avatars} />);
    expect(r.queryAllByTestId("avatar")).toHaveLength(8);
  });

  it("renders 7 avatars when more than 8 are provided and rest are displayed in a button modal", async () => {
    const avatars: { src: string | undefined; name?: string }[] = zeroTo(10).map((i) => ({
      src: undefined,
    }));

    const r = await render(<AvatarGroup avatars={avatars} />);
    expect(r.queryAllByTestId("avatar")).toHaveLength(7);
    click(r.getByText("+ 3 more"));
    expect(r.queryAllByTestId("avatar")).toHaveLength(10);
  });
});
