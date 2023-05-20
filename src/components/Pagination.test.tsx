import { noop } from "src/utils";
import { click, render } from "src/utils/rtl";
import { pageOptions, PageSettings, Pagination, toLimitAndOffset } from "./Pagination";

const init: PageSettings = { pageNumber: 1, pageSize: 100 };

describe("Pagination", () => {
  it("can have a data-testid", async () => {
    const r = await render(<Pagination totalCount={10} page={[init, noop]} data-testid="pag" />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("pag");
  });

  it("defaults data-testid to pagination", async () => {
    const r = await render(<Pagination totalCount={10} page={[init, noop]} />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("pagination");
  });

  it("fires setSettings method on click next icon", async () => {
    // Given a pagination component on page 1 and per page 50
    const setSettings = jest.fn();
    const page = [{ pageNumber: 1, pageSize: 50 }, setSettings] as const;
    const r = await render(<Pagination totalCount={100} page={page} />);
    // When click to go to the next page
    click(r.pagination_nextIcon);
    // Then setSettings is called
    expect(setSettings).toHaveBeenCalledTimes(1);
    expect(setSettings).toHaveBeenCalledWith({ pageNumber: 2, pageSize: 50 });
  });

  it("fires setSettings on select pageSize option", async () => {
    // Given a pagination component on page 1 and per page 50
    const setSettings = jest.fn();
    const page = [{ pageNumber: 1, pageSize: 100 }, setSettings] as const;
    const r = await render(<Pagination page={page} totalCount={10} />);
    // Then pageSize field have value of 100
    expect(r.pagination_pageSize()).toHaveValue("100");
    // When click it
    click(r.pagination_pageSize);
    // And select option 100
    click(r.getByRole("option", { name: "500" }));
    // Then setSettings is called
    expect(setSettings).toHaveBeenCalledTimes(1);
    expect(setSettings).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 500 });
  });

  it("cannot navigate to previous page when are in the first page", async () => {
    // Given a render pagination on page 1
    const page = [{ pageNumber: 1, pageSize: 50 }, jest.fn] as const;
    const r = await render(<Pagination totalCount={10} page={page} />);
    // Then previous page button is disabled
    expect(r.pagination_previousIcon()).toBeDisabled();
  });

  it("cannot navigate to next page when current page is minor than total count / per page", async () => {
    // Given a render pagination on page 5 of 5 pages
    const page = [{ pageNumber: 5, pageSize: 200 }, jest.fn] as const;
    const r = await render(<Pagination totalCount={999} page={page} />);
    // Then next page button is disabled
    expect(r.pagination_nextIcon()).toBeDisabled();
  });

  it("can navigate to next page when current page is greater than total count / per page", async () => {
    // Given a render pagination on page 4 of 5 pages
    const page = [{ pageNumber: 4, pageSize: 200 }, jest.fn] as const;
    const r = await render(<Pagination totalCount={999} page={page} />);
    // Then next page button is not disabled
    expect(r.pagination_nextIcon()).not.toBeDisabled();
  });

  it("shows detailed navigation page info", async () => {
    // Given a render pagination of 999 lines on page 4
    const page = [{ pageNumber: 4, pageSize: 200 }, jest.fn] as const;
    const r = await render(<Pagination totalCount={999} page={page} />);
    // Then show the information about what is paginated
    expect(r.pagination_pageInfoLabel()).toHaveTextContent("601 - 800 of 999"); // we're showing 601-800 from 999 items
  });

  it("shows detailed navigation page info on last page", async () => {
    // Given a render pagination of 999 lines on last page
    const page = [{ pageNumber: 5, pageSize: 200 }, jest.fn] as const;
    const r = await render(<Pagination totalCount={999} page={page} />);
    // Then show the information about what is paginated
    expect(r.pagination_pageInfoLabel()).toHaveTextContent("801 - 999 of 999");
  });

  describe("pageOptions", () => {
    it("returns page options", () => {
      const expected = [100, 500, 1000].map((n) => ({ id: n, name: String(n) }));
      expect(pageOptions).toEqual(expected);
    });
  });

  describe("toLimitAndOffset", () => {
    it("returns offset 0 on first page", () => {
      expect(toLimitAndOffset({ pageNumber: 1, pageSize: 100 })).toEqual({
        limit: 100,
        offset: 0,
      });
    });

    it("returns 100 offset on page 2", () => {
      expect(toLimitAndOffset({ pageNumber: 2, pageSize: 100 })).toEqual({
        limit: 100,
        offset: 100,
      });
    });
  });
});
