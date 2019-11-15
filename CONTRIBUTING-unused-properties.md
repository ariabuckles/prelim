# Let's add unused-object-property-removal to Prelim

## Feature Description

Prelim is an unused-code-removal tool for JavaScript.

It can take some source code like:

```javascript
const bEnabled = false;
const { a, b } = { a: 'hi', b: 'bye' };

console.log(a);
if (bEnabled) {
  console.log(b);
}
```

and transform it into:

```javascript
const { a } = { a: 'hi' };

console.log(a);
```

We want to modify Prelim to support removing unused properties on js objects.
That is, we want to support transforming:

```javascript
const object1 = { a: 1, b: 2 };
console.log(object1.a);
```

into

```javascript
const object1 = { a: 1 };
console.log(object1.a);
```

This sort of transformation is particularly usefor when paired with some
CSS-in-JS libraries that make use of style objects, like React Native or
[Aphrodite][aphrodite]. When using those libraries, a transformation like
this can find unused styles and clean them up from the codebase.

[aphrodite]: https://github.com/Khan/aphrodite


## Background

When JavaScript is run, it is first transformed into a syntax tree: a tree of
node objects describing the code from the point of view of JavaScript
engine/compiler.

Check out [astexplorer.net][astexample] to see the above program as a syntax tree.

[astexample]: https://astexplorer.net/#/gist/1a6a2d7fa664f25788beb46f6896fd20/e3306eb243ede793534be85221750e81f55fe89a

Prelim consists of a collection of [Babel Visitors][visitors]: objects with
methods for handling different types of JavaScript syntax nodes. Check out
[src/visitors/unused-variables.js](src/visitors/unused-variables.js)
for an example visitor which removes unused variables.

[visitors]: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#visitors


## Overview

I've created a new stub visitor in [src/visitors/unused-properties.js](src/visitors/unused-properties.js),
which we should be able to use to add support for removing unused object
properties. I've added a method for handling found `Scope`s,
which are any block that can be the scope of a variable.

At a high level, to remove unused properties, we want to do the following:

1. Find all object variables, and for each of those:
2. Determine if the object is only accessed through dot notation properties
3. Determine what properties the object has
4. Determine what properties are accessed directly as properties on the object
   (through dot notation only)
5. Take the difference of 3 (object properties) and 4 (accessed properties)
6. Remove the properties in the difference from the object


## Logistics

To help us, Babel has a pretty nice API for these sorts of queries and
manipulations.

Here's a variety of the useful API information / helpers we might need:


### [Bindings][bindings]

[bindings]: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#bindings

```javascript
class Binding {
  // the variable identifier
  identifier: node,

  // the VariableDeclarator path where the variable is declared
  path: path,

  // Where the variable is used:
  referencePaths: [path, path, path],

  // Whether the variable is ever reassigned:
  constant: false,

  // ...
}
```


### [Paths][paths]

[paths]: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#paths

```javascript
class NodePath {
  // The Syntax Node (see astexplorer.net for properties)
  node: node,

  // The parent NodePath (useful for walking up the syntax tree)
  parentPath: path,

  // Get a child NodePath at the given key (see astexplorer.net for keys)
  get(key)

  // Is this path's node an identifier?
  isIdentifier()

  // Is this path's node an object literal?
  isObjectExpression()

  // is this path's node a MemberExpression (`obj.prop` or `obj[propName]`)
  isMemberExpression()

  // Remove this path from the tree
  remove()

  // ...
}
```

## Testing

`npm test` will run a basic test script, which you can find in test.sh

