# prelim
Pre-build Dead Code Eliminator for JavaScript

A codemod and babel plugin to find and remove unused code. Built on top of
[Babel](https://github.com/babel/babel) and
[@codemod](https://github.com/codemod-js/codemod).

Usage:

Install with:

```
npm install --save-dev prelim
```

Use as a cli (courtesy of https://github.com/codemod-js/codemod):

```
npx prelim src/directory/
```

Or as a babel plugin (`"prelim"`)
