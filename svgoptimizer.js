/**
 * @module svgoptimizer
 * This module returns a single function which reads in a single .js file, scans it
 * for floating point numbers represented inside Strings, converts them to
 * floating point numbers and finally rewrites them with the specified precision,
 * rounding to the nearest significant digit.
 * This helps in compressing large .js files that contain SVG vector data which
 * contains many over-precise arc and point floating point numbers, sometimes
 * as detailed as 15 decimal places when far less would suffice.
 * @type {exports|module.exports}
 * @param {Object} options - options for the optimization
 * @param {String} options.fileName - full path and file name, relative or absolute
 * @param {Number} [options.precision=4] - the number of decimal places to truncate floats to
 */
var fs = require('fs'),
	path = require('path'),
	Promise = require('promise'),
	readFile,
	writeFile;

readFile = function (fileName) {
	return new Promise(function (fulfill, reject) {
		fs.readFile(fileName, 'utf8', function (err, res) {
			if (err) reject(err);
			else fulfill(res);
		})
	});
};

writeFile = function (fileName, content) {
	return new Promise(function (fulfill, reject) {
		fs.writeFile(fileName, content, 'utf8', function (err) {
			if (err) reject(err);
			else fulfill('Saved: ' + fileName);
		});
	})
};

module.exports = function (options, cb) {
	var DEFAULTS = {
			precision: 4
		},
		filePath = options.filePath;

	readFile(filePath)
		.then(function (res) {
			var floats,
				precision = Math.pow(10, options.precision || DEFAULTS.precision),
				outFile = filePath+'.opt.js';

			console.log('File read successfully!');

			floats = res.replace(/\d{1,3}\.\d*/g, function (match, offset, str) {
				var float = parseFloat(match);

				return Math.round((float*precision))/precision;
			});

			writeFile(outFile, floats)
				.then(function(msg) {
					console.log(msg);
					cb(null, outFile);
				})
				.catch(function(err) {
					console.log('SVGOptimizer error! ' + err);
					cb(err);
				});
		})
		.catch(function (err) {
			/*error case*/
			console.log('SVGOptimizer Error: ' + err);
			cb(err);
		});
};