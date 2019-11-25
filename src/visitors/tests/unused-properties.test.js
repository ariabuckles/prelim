const prelimFunc = require('../../tests/prelim-func');

describe('unused properties', () => {
  it('should remove a single unused variable', () => {
    expect(
      prelimFunc(() => {
        const obj = { a: 5 };
        console.log(obj.notPresentProp);
      })
    ).toMatchInlineSnapshot(`
      const obj = {};
      console.log(obj.notPresentProp);
    `);
  });

  it('should not remove used properties', () => {
    expect(
      prelimFunc(() => {
        const obj = { a: 5 };
        console.log(obj.a);
      })
    ).toMatchInlineSnapshot(`
      const obj = { a: 5 };
      console.log(obj.a);
    `);
  });

  it('should not remove computed properties', () => {
    expect(
      prelimFunc(() => {
        const opts = 'abcdef';
        const a = opts[Math.floor(Math.random() * opts.length)];
        const obj = { [a]: 5, b: 6 };
        console.log(obj.b);
      })
    ).toMatchInlineSnapshot(`
      const opts = 'abcdef';
      const a = opts[Math.floor(Math.random() * opts.length)];
      const obj = { [a]: 5, b: 6 };
      console.log(obj.b);
    `);
  });

  it('should remove unused string literal properties', () => {
    expect(
      prelimFunc(`
        const obj = { 'a': 5, 'b': 7 };
        console.log(obj.b);
      `)
    ).toMatchInlineSnapshot(`
      const obj = { b: 7 };
      console.log(obj.b);
    `);
  });

  it('should leave memberexpression properties in strict mode', () => {
    let code = () => {
      let obj = {
        strictImpure: console.log(32),
        probablyPure: window.test.prop,
        pure: () => window.test.prop,
        safelyUsed: 'used',
      };
      console.log(obj.safelyUsed);
    };
    expect(prelimFunc({ loose: true }, code)).toMatchInlineSnapshot(`
      let obj = {
        strictImpure: console.log(32),
        safelyUsed: 'used',
      };
      console.log(obj.safelyUsed);
    `);
    expect(prelimFunc({ loose: false }, code)).toMatchInlineSnapshot(`
      let obj = {
        strictImpure: console.log(32),
        probablyPure: window.test.prop,
        safelyUsed: 'used',
      };
      console.log(obj.safelyUsed);
    `);
  });

  it('debugtest', () => {
    let code = () => {
      let obj = {
        probablyPure: window.test.prop,
        used: 'used',
      };
      console.log(obj.used);
    };
    expect(prelimFunc({ loose: true }, code)).toMatchInlineSnapshot(`
      let obj = { used: 'used' };
      console.log(obj.used);
    `);
  });
});
