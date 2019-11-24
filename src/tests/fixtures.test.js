const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const plugin = require('../plugin').default;

const fixturePath = path.join(__dirname, 'fixtures');

const fixtures = fs
  .readdirSync(fixturePath)
  .filter((fileName) => /\.js$/.test(fileName))
  .map((fileName) => path.join(fixturePath, fileName));

describe('fixtures', () => {
  for (let fixture of fixtures) {
    it(`should optimize ${path.basename(fixture)}`, () => {
      let { code } = babel.transformFileSync(fixture, { plugins: [plugin] });
      expect(code).toMatchSnapshot();
    });
  }
});
