#!/bin/bash

cat > test.js <<- EOF
let object1 = { a: 1, b: 2 };
console.log(object1.b);
EOF

echo "// Before:"
cat test.js
echo ""

echo "// Running prelim..."
./node_modules/.bin/codemod -p src/plugin.js test.js
echo ""

echo "// After:"
cat test.js
echo ""
