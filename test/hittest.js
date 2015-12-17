var should = require('chai').should();
var hittest = require('../index');
var three = require('three');

describe('Geometry vs Box3', function () {
	var box = new three.Box3(new three.Vector3(1.5, -1, -2), new three.Vector3(4, 2, 3));

	it('can check collision with BoxGeometry', function () {
		var geo = new three.BoxGeometry(1, 1, 1);
		hittest.intersects(box, geo).should.empty;
		
		var geo = new three.BoxGeometry(4, 1, 1);
		hittest.intersects(box, geo).should.not.empty;
	});

	it('can check collision with SphereGeometry', function () {
		var geo = new three.SphereGeometry(1, 8, 8);
		hittest.intersects(box, geo).should.empty;
		
		var geo = new three.SphereGeometry(3, 8, 8);
		hittest.intersects(box, geo).should.not.empty;
	});
});
