"use strict";

var three = require('three');

var Vector3 = three.Vector3;
var Box3 = three.Box3;
var Sphere = three.Sphere;
var Geometry = three.Geometry;

var norm = new three.Vector3();
var t1 = new three.Vector3();
var t2 = new three.Vector3();
var t3 = new three.Vector3();
var t4 = new three.Vector3();
var t5 = new three.Vector3();
var depth = 0;

// this function is 
function checkBoxSeparation(phase, minX, minY, minZ, maxX, maxY, maxZ, norm, v1, v2, v3)
{
	var minQ, maxQ;
	minQ = norm.x * (norm.x > 0 ? minX : maxX);
	maxQ = norm.x * (norm.x > 0 ? maxX : minX);
	minQ += norm.y * (norm.y > 0 ? minY : maxY);
	maxQ += norm.y * (norm.y > 0 ? maxY : minY);
	minQ += norm.z * (norm.z > 0 ? minZ : maxZ);
	maxQ += norm.z * (norm.z > 0 ? maxZ : minZ);

	var q1 = norm.x * v1.x + norm.y * v1.y + norm.z * v1.z;
	var q2 = norm.x * v2.x + norm.y * v2.y + norm.z * v2.z;
	var q3 = norm.x * v3.x + norm.y * v3.y + norm.z * v3.z;
	var vMinQ = Math.min(q1, q2, q3), vMaxQ = Math.max(q1, q2, q3);

	if (phase === 0) {
		// just check the collision
		return minQ > vMaxQ || maxQ < vMinQ;
	} else {
		// compute penetration depth
		var sq = 1 / norm.length();
		if (!isFinite(sq)) {
			return;
		}
		depth = Math.min(depth, (vMaxQ - minQ) * sq, (maxQ - vMinQ) * sq);
	}
}

function geometryIntersectsBox3_PassThree(phase, minX, minY, minZ, maxX, maxY, maxZ, 
	axis, v1, v2, v3, t1, t2)
{
	t1.subVectors(v1, v2);

	switch (axis) {
		case 0:
			t1.set(0, -t1.z, t1.y);
			break;
		case 1:
			t1.set(-t1.z, 0, t1.x);
			break;
		case 2:
			t1.set(-t1.y, t1.x, 0);
			break;
	}

	return checkBoxSeparation(phase, minX, minY, minZ, maxX, maxY, maxZ, t1, v1, v2, v3);
}

function geometryIntersectsBox3(geo, box)
{
	// Tomas Akenine-Möller. 2005. Fast 3D triangle-box overlap testing.
	// http://fileadmin.cs.lth.se/cs/Personal/Tomas_Akenine-Moller/code/tribox_tam.pdf

	var faces = geo.faces;
	var verts = geo.vertices;
	var minX = box.min.x, maxX = box.max.x;
	var minY = box.min.y, maxY = box.max.y;
	var minZ = box.min.z, maxZ = box.max.z;
	var results = [];

	for (var fI = 0; fI < faces.length; ++fI)
	{
		var face = faces[fI];
		var v1 = verts[face.a];
		var v2 = verts[face.b];
		var v3 = verts[face.c];
		var vMinX = Math.min(v1.x, v2.x, v3.x);
		var vMinY = Math.min(v1.y, v2.y, v3.y);
		var vMinZ = Math.min(v1.z, v2.z, v3.z);
		var vMaxX = Math.max(v1.x, v2.x, v3.x);
		var vMaxY = Math.max(v1.y, v2.y, v3.y);
		var vMaxZ = Math.max(v1.z, v2.z, v3.z);

		// bounding AABB cull
		if (vMinX > maxX ||
			vMinY > maxY ||
			vMinZ > maxZ ||
			vMaxX < minX ||
			vMaxY < minY ||
			vMaxZ < minZ) {
			// never be intersecting
			continue;
		}

		t1.subVectors(v2, v1);
		t2.subVectors(v3, v1);
		norm.crossVectors(t1, t2);

		if (checkBoxSeparation(0, minX, minY, minZ, maxX, maxY, maxZ, 
				norm, v1, v2, v3) ||
			geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 
				0, v1, v2, v3, t1, t2) ||
			geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 
				0, v1, v3, v2, t1, t2) ||
			geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 
				0, v2, v3, v1, t1, t2) ||
			geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 
				1, v1, v2, v3, t1, t2) ||
			geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 
				1, v1, v3, v2, t1, t2) ||
			geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 
				1, v2, v3, v1, t1, t2) ||
			geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 
				2, v1, v2, v3, t1, t2) ||
			geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 
				2, v1, v3, v2, t1, t2) ||
			geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 
				2, v2, v3, v1, t1, t2)) {
			// never be intersecting
			continue;
		}

		// compute depth
		depth = Infinity;
		checkBoxSeparation(1, minX, minY, minZ, maxX, maxY, maxZ, 
				norm, v1, v2, v3);
		geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 
			0, v1, v2, v3, t1, t2);
		geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 
			0, v1, v3, v2, t1, t2);
		geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 
			0, v2, v3, v1, t1, t2);
		geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 
			1, v1, v2, v3, t1, t2);
		geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 
			1, v1, v3, v2, t1, t2);
		geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 
			1, v2, v3, v1, t1, t2);
		geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 
			2, v1, v2, v3, t1, t2);
		geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 
			2, v1, v3, v2, t1, t2);
		geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 
			2, v2, v3, v1, t1, t2);

		// triangle touches the box
		results.push({
			faceIndex: fI,
			depth: depth
		});

	}

	return results;
}

function geometryIntersectsSphere(geo, sphere)
{
	var faces = geo.faces;
	var verts = geo.vertices;
	var center = sphere.center;
	var cx = center.x;
	var cy = center.y;
	var cz = center.z;
	var radius = sphere.radius;
	var minX = cx - radius, maxX = cx + radius;
	var minY = cy - radius, maxY = cy + radius;
	var minZ = cz - radius, maxZ = cz + radius;
	var results = [];

	for (var fI = 0; fI < faces.length; ++fI)
	{
		var face = faces[fI];
		var v1 = verts[face.a];
		var v2 = verts[face.b];
		var v3 = verts[face.c];
		var vMinX = Math.min(v1.x, v2.x, v3.x);
		var vMinY = Math.min(v1.y, v2.y, v3.y);
		var vMinZ = Math.min(v1.z, v2.z, v3.z);
		var vMaxX = Math.max(v1.x, v2.x, v3.x);
		var vMaxY = Math.max(v1.y, v2.y, v3.y);
		var vMaxZ = Math.max(v1.z, v2.z, v3.z);

		// bounding AABB cull
		if (vMinX > maxX ||
			vMinY > maxY ||
			vMinZ > maxZ ||
			vMaxX < minX ||
			vMaxY < minY ||
			vMaxZ < minZ) {
			// never be intersecting
			continue;
		}

		// compute normal
		t1.subVectors(v2, v1);
		t2.subVectors(v3, v1);
		norm.crossVectors(t1, t2);
		if (norm.x == 0 && norm.y == 0 && norm.z == 0) {
			// degenerate polygon (ignore for now)
			continue;
		}
		norm.normalize();

		// touching the plane?
		var vQ = norm.dot(v1);
		var q = norm.dot(center);
		var dq = Math.abs(q - vQ);
		if (dq > radius) {
			continue;
		}

		// in prism?
		t1.subVectors(v2, v1);
		t1.crossVectors(t1, norm);
		t2.subVectors(center, v1);
		var p1 = t1.dot(t2);

		t1.subVectors(v3, v2);
		t1.crossVectors(t1, norm);
		t2.subVectors(center, v2);
		var p2 = t1.dot(t2);
		
		t1.subVectors(v1, v3);
		t1.crossVectors(t1, norm);
		t2.subVectors(center, v3);
		var p3 = t1.dot(t2);

		if (p1 <= 0 && p2 <= 0 && p3 <= 0) {
			// sphere's center is inside the prism
			results.push({
				faceIndex: fI,
				depth: radius - dq,
				pos: new Vector3(
					cx - (q - vQ) * norm.x,
					cy - (q - vQ) * norm.y,
					cz - (q - vQ) * norm.z)
			});
		} else {
			var dist = Infinity;
			var distI = 0;

			t1.subVectors(v2, v1);
			t2.subVectors(v3, v2);
			t3.subVectors(v1, v3);

			var l1 = t1.lengthSq();
			var l2 = t2.lengthSq();
			var l3 = t3.lengthSq();

			// check edge
			var d;
			t4.subVectors(center, v1);
			d = t4.dot(t1);
			if (d >= 0 && d <= l1) {
				t5.subVectors(center, v2);
				t4.crossVectors(t4, t5);
				d = t4.lengthSq() / l1;
				if (d < dist) {
					dist = d; distI = 0;
				}
			}
			t4.subVectors(center, v2);
			d = t4.dot(t2);
			if (d >= 0 && d <= l2) {
				t5.subVectors(center, v3);
				t4.crossVectors(t4, t5);
				d = t4.lengthSq() / l2;
				if (d < dist) {
					dist = d; distI = 1;
				}
			}
			t4.subVectors(center, v3);
			d = t4.dot(t3);
			if (d >= 0 && d <= l3) {
				t5.subVectors(center, v1);
				t4.crossVectors(t4, t5);
				d = t4.lengthSq() / l3;
				if (d < dist) {
					dist = d; distI = 2;
				}
			}

			// check corner
			t4.subVectors(center, v1);
			d = t4.lengthSq();
			if (d < dist) {
				dist = d; distI = 3;
			}
			t4.subVectors(center, v2);
			d = t4.lengthSq();
			if (d < dist) {
				dist = d; distI = 4;
			}
			t4.subVectors(center, v3);
			d = t4.lengthSq();
			if (d < dist) {
				dist = d; distI = 5;
			}

			if (dist > radius * radius) {
				continue;
			}

			// get the minimum distance
			var pos = null;
			switch (distI) {
				case 0:
					t4.subVectors(center, v1);
					pos = t5.copy(v1);
					pos.addScaledVector(t1, Math.sqrt(t4.dot(t1) / l1));
					break;
				case 1:
					t4.subVectors(center, v2);
					pos = t5.copy(v2);
					pos.addScaledVector(t2, Math.sqrt(t4.dot(t2) / l2));
					break;
				case 2:
					t4.subVectors(center, v3);
					pos = t5.copy(v3);
					pos.addScaledVector(t3, Math.sqrt(t4.dot(t3) / l3));
					break;
				case 3:
					pos = v1;
					break;
				case 4:
					pos = v2;
					break;
				case 5:
					pos = v3;
					break;
			}

			results.push({
				faceIndex: fI,
				depth: radius - Math.sqrt(dist),
				pos: pos.clone()
			});
		}

		// triangle touches the box

	}

	return results;
}

function throwUnsupportedCombination(a, b)
{
	throw new Error("specified combination is not supported.");
}

var intersects = exports.intersects = function (a, b) {
	if (a instanceof Geometry) {
		if (b instanceof Box3) {
			return geometryIntersectsBox3(a, b);
		} else if (b instanceof Sphere) {
			return geometryIntersectsSphere(a, b);
		} else {
			return throwUnsupportedCombination(a, b);
		}
	} else if (b instanceof Geometry) {
		return intersects(b, a);
	} else {
		return throwUnsupportedCombination(a, b);
	}
};
