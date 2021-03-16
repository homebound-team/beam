import { matchers } from "@emotion/jest";
import "@testing-library/jest-dom/extend-expect";

beforeEach(() => jest.useFakeTimers("modern"));
afterEach(() => jest.useRealTimers());

// Add toHaveStyleRule
expect.extend(matchers);
