# Let's add unused-object-property-removal to Prelim

## Background

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


## Setup



