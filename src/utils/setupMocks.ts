// export const setupMockComponents = () => {
export const setupMockComponents = [createMockRefObj("SelectField")];
  // return [];
  // return []

  // find any .mock files
  // const mocks = [];
  // loop through each and set up mock
  // mocks.push(
  // jest.mock("SelectField", () => {
  //   return require("SelectField.mock");
  // });
  // );
  // return {};
  // mocks.push(
  // jest.mock("DateField", () => {
  //   return require("DateField.mock");
  // });
  // );

  // jest.mock("@homebound/beam/dist/inputs/SelectField", () => {
  //   console.log("REQUIRE!!", require("@homebound/beam/dist/inputs/SelectField.mock"));
  //   return require("@homebound/beam/dist/inputs/SelectField.mock");
  // });
  // mocks.push(
    // return jest.setMock("@homebound/beam/dist/inputs/SelectField", () => {
    //   return require("");
    // });
  // );
  // mocks.push(
  // jest.mock("@homebound/beam/dist/inputs/SelectField", () => {
  //   console.log("REQUIRE!!", require("@homebound/beam/dist/inputs/SelectField.mock"));
  //   return require("@homebound/beam/dist/inputs/SelectField.mock");
  // });

  // jest.mock("@homebound/beam/dist/inputs/DateField", () => {
  //   return require("src/mocks/MockDateField");
  // });

  // jest.mock("@homebound/beam/dist/components/RichTextField", () => {
  //   return require("src/mocks/MockTextField");
  // });
  // );
  // jest.mock("@homebound/beam/dist/inputs/MultiSelectField", () => {
  //   return require("src/inputs/MultiSelectField.mock");
  // });
  // console.log("mocks", mocks);
  // return mocks;
// };

// export const setupMockComponents = `jest.mock("@homebound/beam/dist/inputs/MultiSelectField", () => {
//   return require("src/inputs/MultiSelectField.mock");
// });`

// export const setupMockComponents = () => {
//   return `jest.mock("@homebound/beam/dist/inputs/SelectField", () => {
//     return require("src/inputs/SelectField.mock");
//   });`
// };

function createMockRefObj(componentName: string) {
  return {
    componentPath: `@homebound/beam/dist/inputs/${componentName}`,
    mockPath: `@homebound/beam/dist/inputs/${componentName}.mock`,
  };
}
