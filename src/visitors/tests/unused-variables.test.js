const prelimFunc = require('../../tests/prelim-func');

describe('unused variables', () => {
  it('should remove a single unused variable', () => {
    expect(
      prelimFunc(() => {
        const a = 5;
      })
    ).toMatchInlineSnapshot(``);
  });

  it('should leave a single used variable', () => {
    expect(
      prelimFunc(() => {
        const a = 5;
        document.body.append(a);
      })
    ).toMatchInlineSnapshot(`
      const a = 5;
      document.body.append(a);
    `);
  });

  it('should only remove unused variables', () => {
    expect(
      prelimFunc(() => {
        const a = 5;
        const b = 7;
        document.body.append(a);
      })
    ).toMatchInlineSnapshot(`
      const a = 5;
      document.body.append(a);
    `);
  });

  it('should remove unused member expressions only in loose mode', () => {
    expect(
      prelimFunc({ loose: true }, () => {
        const f = window.test.min;
      })
    ).toMatchInlineSnapshot(``);
    expect(
      prelimFunc({ loose: false }, () => {
        const f = window.test.min;
      })
    ).toMatchInlineSnapshot(`const f = window.test.min;`);
  });
});
