const path = require('path');

module.exports = {
  setupFiles: [
    './tests/setup.js'
  ],
  moduleFileExtensions: [
    'js',
    'jsx',
  ],
  modulePaths: [
    path.resolve(__dirname, '.')
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": path.resolve(__dirname, './tests/__mocks__/fileMock.js'),
      ".*\\.(css|less|scss)$": path.resolve(__dirname, './tests/__mocks__/styleMock.js')
  },
  transform: {
    "^.+\\.js$": "babel-jest",
    "^.+\\.jsx$": "babel-jest"
  },
  coveragePathIgnorePatterns: [
    path.resolve(__dirname, './node_modules/'),
    path.resolve(__dirname, './common/reducers'),
  ],
}