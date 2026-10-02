module.exports = {
  testEnvironment: "node",
  transformIgnorePatterns: ["/node_modules/(?!.*@noble/secp256k1/)"],
  moduleNameMapper: {
    "^(\\.\\.?\\/.+)\\.js$": "$1",
  },
};
