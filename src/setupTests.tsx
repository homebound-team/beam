import createCache from "@emotion/cache";
import { matchers } from "@emotion/jest";
import { CacheProvider } from "@emotion/react";
import { globalWrappers } from "@homebound/rtl-utils";
import "@testing-library/jest-dom/extend-expect";

beforeEach(() => jest.useFakeTimers("modern"));
afterEach(() => jest.useRealTimers());

// Add toHaveStyleRule
expect.extend(matchers);

// Skip browser prefixes for snapshot tests
const emotionCache = createCache({ key: "css" });
globalWrappers.push({ wrap: (c) => <CacheProvider value={emotionCache}>{c}</CacheProvider> });
