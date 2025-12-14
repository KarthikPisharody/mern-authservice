const { createDefaultPreset } = require("ts-jest");

module.exports = {
  testEnvironment: "node",
  transform: createDefaultPreset().transform,
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },

  verbose: true,
};
