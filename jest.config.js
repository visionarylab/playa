module.exports = {
  roots: [
    "<rootDir>/src"
  ],
  testMatch: [
    "**/?(*.)+(test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  setupFilesAfterEnv: [
    "<rootDir>/test/testSetup.ts"
  ],
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "<rootDir>/test/__mocks__/styleMock.js",
    "\\.(gif|ttf|eot|svg)$": "<rootDir>/test/__mocks__/fileMock.js",
    "react-virtualized-auto-sizer": "<rootDir>/test/__mocks__/react-virtualized-auto-sizer.tsx",
    "disconnect": "<rootDir>/test/__mocks__/disconnect.js",
    "electron": "<rootDir>/test/__mocks__/electron.js",
    "music-metadata": "<rootDir>/test/__mocks__/music-metadata.js",
    "pouchdb": "<rootDir>/test/__mocks__/pouchdb.ts",
    "@fortawesome/react-fontawesome": "<rootDir>/test/__mocks__/@fortawesome/react-fontawesome.tsx"
  }
}
