// jest.config.js
export default {
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
  transform: {},
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "./test", outputName: "jest-junit.xml" }],
  ],
};
