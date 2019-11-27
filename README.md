# prelim: A Pre-build Unused Code Eliminator for JavaScript

Prelim is an unused code removal (dead code elimination) tool for javascript.

Unlike other tools in this space, such as babel-minify or terserjs, prelim is
focused on the "pre-build" use case: it's meant to be used outside of a build
process to find and remove no-longer-used code so that humans can better read
and understand their code.

You can run prelim directly on your source folder, like:

```sh
npx prelim src/
```

You can also use prelim in conjunction with other tools, such as a codemod or
find-replace to remove a no-longer-used feature flag.

You can also use prelim as a babel plugin if you would like (although at the
moment prelim provides more benefit when run outside of a build process, it
can produce some savings that terserjs may not be able to identify as unused).


## Usage

Installation:

```sh
npm install --save-dev prelim
```

Useage: as a cli:

```sh
npx prelim src/directory/
```

Or as a babel plugin:

```javascript
module.exports = {
    /* ... */
    plugins: [
        // `loose:` enables not-strictly safe optimizations, and is recommended
        // for code that does not have getters/proxies with side-effects.
        // The default is `false` (equivalent to `--strict` in the cli)
        ['prelim', { loose: true }],
    ],
};
```


## Supported optimizations

Prelim supports a few different types of optimizations:

### Unused variable deletion

Prelim can find and delete unused variables whose initializations appear to be
free of side effects.

### Unused property deletion

Prelim can find and delete unused properties in object literal variables whose
values appear to be free of side effects.

### Unreachable conditional branches

Prelim can find and replace if statements and conditional operator expressions
where only one branch is taken because the condition always evaluates to a truthy
or falsy value.

### Boolean expression simplification

Prelim can simplify if-conditions and other boolean expressions where parts of
the expression always evaluate to truthy or falsy values.


## Bugs

Please report bugs or issues you run into with [github issues][issues].

[issues]: https://github.com/ariabuckles/prelim/issues


## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for background for contributing.


## License

Prelim is [MIT licensed](LICENSE).
