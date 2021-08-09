export const setupMockComponents = () => {
  // find any .mock files
  // const mocks = [];

  // loop through each and set up mock
  // mocks.push(
  // jest.mock("SelectField", () => {
  //   return require("SelectField.mock");
  // });
  // );

  // mocks.push(
  // jest.mock("DateField", () => {
  //   return require("DateField.mock");
  // });
  // );

  // mocks.push(
  jest.mock("@homebound/beam/dist/inputs/SelectField", () => {
    return require("src/inputs/SelectField.mock.ts");
  });

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
  // return mocks;
};
