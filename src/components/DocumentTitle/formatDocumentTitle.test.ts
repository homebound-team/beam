import { formatDocumentTitle, joinDocumentTitleSegments } from "src/components/DocumentTitle/formatDocumentTitle";

describe("formatDocumentTitle", () => {
  it("joins page title and suffix", () => {
    // Given prod env with a page title and app suffix
    // When formatting the document title
    const result = formatDocumentTitle({
      env: "prod",
      pageTitle: "Projects",
      suffix: "Blueprint | Homebound",
    });

    // Then the page title and suffix are joined
    expect(result).toBe("Projects | Blueprint | Homebound");
  });

  it("includes env prefix for non-prod", () => {
    // Given a non-prod env with a page title and app suffix
    // When formatting the document title
    const result = formatDocumentTitle({
      env: "qa",
      pageTitle: "Schedule | 123 Sesame St",
      suffix: "Blueprint | Homebound",
    });

    // Then the env prefix is included
    expect(result).toBe("[QA] Schedule | 123 Sesame St | Blueprint | Homebound");
  });

  it("returns env prefix and app suffix when page title is omitted", () => {
    // Given local env and app suffix with no page title
    // When formatting the document title
    const result = formatDocumentTitle({
      env: "local",
      suffix: "Blueprint | Homebound",
    });

    // Then only the env prefix and app suffix are returned
    expect(result).toBe("[LOCAL] Blueprint | Homebound");
  });

  it("returns an empty string for prod with no suffix and no page title", () => {
    // Given prod env with no page title or suffix
    // When formatting the document title
    const result = formatDocumentTitle({ env: "prod" });

    // Then the result is empty
    expect(result).toBe("");
  });
});

describe("joinDocumentTitleSegments", () => {
  it("joins non-empty segments", () => {
    // Given multiple page title segments
    // When joining them
    const result = joinDocumentTitleSegments("Schedule", "123 Sesame St");

    // Then they are separated by the document title separator
    expect(result).toBe("Schedule | 123 Sesame St");
  });

  it("omits undefined and blank segments", () => {
    // Given a mix of valid and empty segments
    // When joining them
    const result = joinDocumentTitleSegments("Schedule", undefined, "");

    // Then only the valid segment remains
    expect(result).toBe("Schedule");
  });

  it("returns undefined when all segments are empty", () => {
    // Given only empty segments
    // When joining them
    const result = joinDocumentTitleSegments(undefined, "");

    // Then no page title is produced
    expect(result).toBeUndefined();
  });
});
