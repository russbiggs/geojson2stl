const fs = require('fs');
const geojson2stl = require('../');
const test = require('tape');

const options = {
    "output": "./outputs/test.stl",
    "extrude": 10,
    "size": 100
};

test("geojson2stl(test.geojson) with options", function(test) {
    let geojson = fs.readFileSync("tests/test.geojson");
    let actual = geojson2stl(JSON.parse(geojson), options);
    let expected = fs.readFileSync("tests/test.stl", "utf8");
    test.deepEqual(actual, expected);
    test.end();
});