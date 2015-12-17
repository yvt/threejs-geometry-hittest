
threejs-geometry-hittest
========================

This module provides a convenient method to check whether the given `Geometry` intersects
with another object, in O(n) where n is the number of faces in the `Geometry`. This
library could be useful for a project that don't need full-featured physics library but
want to do some hit-test.

Following objects are supported:

 * `Box3`
 * `Sphere`

Please feel free to make pull requests, if you feel you can make this library better!

Example
-------

```js
const three = require('three');
const intersects = require('threejs-box-hittest').intersects;

// objects
const geometry = new three.BoxGeometry(1, 1, 1);
const box3 = new three.Box3(
	new three.Vector3(0.5, 0.5, 0.5),
	new three.Vector3(1.5, 1.5, 1.5)
);

// do hit-test. array returned.
const results = intersects(geometry, box3);

// indexes of faces intersecting with the box are printed to the console
for (const result of results) {
	console.log(`faceIndex = ${result.faceIndex}`);
}
```
