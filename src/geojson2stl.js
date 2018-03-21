const fs = require('fs');
const commander = require('commander');
const geojson2stl = require('../build');
const bbox = require('@turf/bbox').default;
const colors = require('colors');

commander.version(require('../package.json').version)
        .usage('[options] [file]')
        .description('Convert a GeoJSON to STL.')
        .option('-o, --output <path>', 'output file name', './output.stl')
        .option('-e, --extrude <int>', 'extrude value in mm, default 1mm', 1)
        .option('-s, --size <int>', 'size in mm, default is 200mm', 200)
        .parse(process.argv);

if (commander.args.length === 0) {
    console.error();
    console.error("  error: no input file given");
    console.error();
    process.exit(1);
}

fs.readFile(commander.args[0], 'utf-8', (err, data) => {
    let options = {};
    options.size = parseInt(commander.size)
    options.extrude = parseInt(commander.extrude);
    options.output = commander.output;
    let geojson = JSON.parse(data);
    let dims = bbox(geojson);
    let xDiff = dims[2] - dims[0];
    let yDiff = dims[3] - dims[1];
    let xDim, yDim;
    if (xDiff > yDiff) {
        xDim = options.size;
        yDim = options.size * yDiff/xDiff;
    } else if (yDiff > xDiff)  {
        xDim = options.size * xDiff/yDiff;
        yDim = options.size;
    } else {
        xDim = options.size;
        yDim = options.size;
    }
    let stl =  geojson2stl(geojson, options);
    console.log(colors.blue(`output dimensions 📏`));
    console.log(colors.blue(`x\t${xDim}mm`));
    console.log(colors.blue(`y\t${yDim}mm`));
    console.log(colors.blue(`z\t${options.extrude}mm`));
    fs.writeFile(options.output, stl, () => {
        console.log(colors.green(`${options.output} written.`));
    });
});
