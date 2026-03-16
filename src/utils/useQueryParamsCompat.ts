import useQueryParamsPackage from "use-query-params";

const useQueryParamsExports = useQueryParamsPackage as typeof import("use-query-params");

export const { JsonParam, QueryParamProvider, StringParam, useQueryParams } = useQueryParamsExports;
