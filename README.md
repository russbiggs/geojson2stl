# Convert GeoJSON to ASCII STL


### Installation
```sh
npm install geojson2stl
```

### In the terminal
```sh
geojson2stl example.geojson
```


#### Flags

-o
--output


Sets the output file path and file name

_Default_: ./output.stl


-e
--extrude


Sets the millimeters to extrude the shape

_Default_: 1


-s
--size


Set the maximum dimension (in x or y dimensions) of the output shape in millimeters

_Default_:200


example
```
geojson2stl -s 150 -e 10 -o ./example.stl example.geojson
```
returns a 150mm maximum dimension, 10mm extrude file named example.stl


### in Node
```js
const geojson2stl = require('geojson2stl');
const fs = require('fs');

fs.readFile('./myFeatures.geojson', 'utf-8', (err,data) => {
    let options = {};
    options.size = 150; //150mm maximum width or height
    options.extrude = 5; //extrude 5mm in z axis
    let stl = geojson2stl(data, options);
    ...
    ...
});
```


## Reference

geojson2stl(geojson[, options]]) <>

Takes a required parameter of geojson and returns ASCII STL text of the input geojson. Options is an opject with the following optional attributes:
* ``` output``` - filename to give name attribute in STL file _default_: 'output.stl'
* ``` extrude``` - a number indicating millimeters to extrude the shape _default_: 1
* ``` size``` - a number indicating the maximum dimension of the output shape _default_: 200



## Caveats
expects geojson as WGS84 (as per the [specification](https://tools.ietf.org/html/rfc7946)) and projects all coordinates to mercator.