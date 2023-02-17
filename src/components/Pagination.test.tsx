import { noop } from "src/utils";
import { click, render } from "src/utils/rtl";
import { initPageSettings, pageOptions, Pagination, toFirstAndOffset } from "./Pagination";

describe("Pagination", () => {
  it("can have a data-testid", async () => {
    const r = await render(
      <Pagination totalCount={10} label="" setSettings={noop} settings={initPageSettings} data-testid="pag" />,
    );
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("pag");
  });

  it("defaults data-testid to pagination", async () => {
    const r = await render(<Pagination totalCount={10} label="" setSettings={noop} settings={initPageSettings} />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("pagination");
  });

  it("fires setSettings method on click next icon", async () => {
    // Given a pagination component on page 1 and per page 50
    const setSettings = jest.fn();
    const r = await render(
      <Pagination totalCount={100} label="" setSettings={setSettings} settings={{ page: 1, perPage: 50 }} />,
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
      <Pagination totalCount={10} label="" setSettings={setSettings} settings={{ page: 1, perPage: 50 }} />,
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
      <Pagination totalCount={10} label="" setSettings={jest.fn} settings={{ page: 1, perPage: 50 }} />,
    );
    // Then previous page button is disabled
    expect(r.pagination_previousIcon()).toBeDisabled();
  });

  it("cannot navigate to next page when current page is minor than total count / per page", async () => {
    // Given a render pagination on page 1
    const r = await render(
      <Pagination totalCount={999} label="" setSettings={jest.fn} settings={{ page: 5, perPage: 200 }} />,
    );
    // Then next page button is disabled
    expect(r.pagination_nextIcon()).toBeDisabled();
  });

  it("can navigate to next page when current page is greater than total count / per page", async () => {
    // Given a render pagination on page 1
    const r = await render(
      <Pagination totalCount={999} label="" setSettings={jest.fn} settings={{ page: 4, perPage: 200 }} />,
    );
    // Then next page button is not disabled
    expect(r.pagination_nextIcon()).not.toBeDisabled();
  });

  describe("pageOptions", () => {
    it("returns page options", () => {
      const expected = [50, 100, 150, 200].map((n) => ({ id: n, name: String(n) }));
      expect(pageOptions).toEqual(expected);
    });
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
