import { noop } from "src/utils";
import { click, render } from "src/utils/rtl";
import { initPageSettings, Pagination, toFirstAndOffset } from "./Pagination";

describe("Pagination", () => {
  it("can have a data-testid", async () => {
    const r = await render(
      <Pagination hasNextPage={true} label="" setSettings={noop} settings={initPageSettings} data-testid="pag" />,
    );
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("pag");
  });

  it("defaults data-testid to pagination", async () => {
    const r = await render(<Pagination hasNextPage={true} label="" setSettings={noop} settings={initPageSettings} />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("pagination");
  });

  it("fires setSettings method on click next icon", async () => {
    // Given a pagination component on page 1 and per page 50
    const setSettings = jest.fn();
    const r = await render(
      <Pagination hasNextPage={true} label="" setSettings={setSettings} settings={{ page: 1, perPage: 50 }} />,
    );
    // When click to go to the next page
    click(r.pagination_nextIcon);
    // Then setSettings is called
    expect(setSettings).toHaveBeenCalledTimes(1);
    expect(setSettings).toHaveBeenCalledWith({ page: 2, perPage: 50 });
  });

  it("fires setSettings on select perPage option", async () => {
    // Given a pagination component on page 1 and per page 50
    const setSettings = jest.fn();
    const r = await render(
      <Pagination hasNextPage={true} label="" setSettings={setSettings} settings={{ page: 1, perPage: 50 }} />,
    );
    // Then perPage field have value of 50
    expect(r.pagination_perPage()).toHaveValue("50");
    // When click it
    r.pagination_perPage().click();
    // And select option 100
    click(r.getByRole("option", { name: "100" }));
    // Then setSettings is called
    expect(setSettings).toHaveBeenCalledTimes(1);
    expect(setSettings).toHaveBeenCalledWith({ page: 1, perPage: 100 });
  });

  it("cannot navigate to previous page when are in the first page", async () => {
    // Given a render pagination on page 1
    const r = await render(
      <Pagination hasNextPage={false} label="" setSettings={jest.fn} settings={{ page: 1, perPage: 50 }} />,
    );
    // Then previous page button is disabled
    expect(r.pagination_previousIcon()).toBeDisabled();
  });

  it("cannot navigate to next page when hasNextPage=false", async () => {
    // Given a render pagination on page 1
    const r = await render(
      <Pagination hasNextPage={true} label="" setSettings={jest.fn} settings={{ page: 1, perPage: 10 }} />,
    );
    // Then next page button is not disabled
    expect(r.pagination_nextIcon()).not.toBeDisabled();
  });

  describe("toFirstAndOffset", () => {
    it("returns offset 0 on first page", () => {
      expect(toFirstAndOffset(initPageSettings.page, initPageSettings.perPage)).toEqual({ first: 100, offset: 0 });
    });
    it("returns 100 offset on page 2", () => {
      expect(toFirstAndOffset(initPageSettings.page + 1, initPageSettings.perPage)).toEqual({
        first: 100,
        offset: 100,
      });
    });
  });
});
