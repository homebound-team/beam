declare namespace jest {
  interface Matchers<R> {
    toNotBeInTheDom(): CustomMatcherResult;
  }
}
