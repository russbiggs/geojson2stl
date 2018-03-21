const centroid = require('@turf/centroid').default;
const bbox = require('@turf/bbox').default;
const projection = require('@turf/projection');
const earcut = require('earcut');
const path = require('path');

module.exports = ( geojson, options )=>{
    let output = './output.stl';
    if (options && options.output != null) output = options.output;
    let extrude = 1;
    if (options && options.extrude != null) extrude = options.extrude;
    let size = 200;
    if (options && options.size != null) size = options.size;
    let projected = projection.toMercator(geojson);
    let scaled = scaleFeatures(projected, size);
    let facets = '';
    for (let i = 0; i < scaled.features.length; i++) {
        let feature = scaled.features[i].geometry.coordinates[0];
        facets += convertFeature(feature, extrude, size);
    } 
    let filename = path.parse(output).base.split('.')[0];
    return combineStl(filename, facets);
};

const convertFeature = ( feature, extrusion, size )=>{
    let stl = '';
    let bottom = [];
    let top = [];
    for (let i = 0; i < feature.length; i++) {
        bottom.push(feature[i].concat(0));
        top.push(feature[i].concat(extrusion));
    }
    let lines = [];
    for (let i = 0; i < feature.length; i++) {
        let line = [feature[i], feature[i + 1]];
        if (i + 1 != feature.length) {
            lines.push(line);
        } 
    }
    for (let i = 0; i < lines.length; i++) {
        let facet = createFace(lines[i], extrusion);
        stl += facet;
    }
    stl += triangulate([top]);
    stl += triangulate([bottom]);
    return stl;
}

const triangulate = ( face )=>{
    let flat = earcut.flatten(face);
    let tris = earcut(flat.vertices, flat.holes, flat.dimensions);
    let arrays = [];
    let size = 3;
    while (tris.length > 0) {
        arrays.push(tris.splice(0, size));
    }
    let triangles = '';
    for (let i = 0; i < arrays.length; i++) {
        let facet = stlFacet(face[0][arrays[i][0]], face[0][arrays[i][1]], face[0][arrays[i][2]]);
        triangles += facet;
    }
    return triangles;
}

const scaleFeatures= ( feature, size )=> {
    let featureCentroid = centroid(feature).geometry.coordinates;
    let dims = bbox(feature);
    let xDiff = dims[2] - dims[0];
    let yDiff = dims[3] - dims[1];
    let xDim, yDim;
    if (xDiff > yDiff) {
        xDim = size;
        yDim = size * yDiff/xDiff;
    } else if (yDiff > xDiff)  {
        xDim = size * xDiff/yDiff;
        yDim = size;
    } else {
        xDim = size;
        yDim = size;
    }
    let xSize = xDim/xDiff;
    let ySize = yDim/yDiff;
    let offset = [-featureCentroid[0], -featureCentroid[1]];
    for (let i = 0; i<feature.features.length; i++) {
        let coordsOffset = [];
        for (let j=0; j<feature.features[i].geometry.coordinates[0].length; j++) {
            let coords = feature.features[i].geometry.coordinates[0][j];
            let newCoords = [(coords[0] + offset[0]) * xSize, (coords[1] + offset[1]) * ySize];
            coordsOffset.push(newCoords);
        }
        feature.features[i].geometry.coordinates = [coordsOffset];
    }
    return feature;
}

const createFace = (line, extrusion )=>{
    let start = line[0];
    let end = line[1];
    let triangle1 = stlFacet(start.concat(0), start.concat(extrusion), end.concat(extrusion));
    let triangle2 = stlFacet(start.concat(0), end.concat(0), end.concat(extrusion));
    let face = `${triangle1}${triangle2}`;
    return face;
}

const stlFacet= ( point1, point2, point3 )=>{
    let loop = `facet normal 1.0 1.0 1.0 
        outer loop
            vertex ${point1[0]} ${point1[1]} ${point1[2]}
            vertex ${point2[0]} ${point2[1]} ${point2[2]}
            vertex ${point3[0]} ${point3[1]} ${point3[2]}
        endloop
    endfacet\n`;
    return loop;
}

const combineStl = ( name, facets )=>{
    let template = `solid ${name}\n${facets}`;
    return template;
}