'use strict';

var gulp = require('gulp');
var http = require('http');
var jsdom = require('jsdom');
var fs = require('fs');
var mkdirp = require('mkdirp');
var html = '';
var projectDirectory = 'C:\\wamp\\www\\Email';
var curDirectory = __dirname;
var outputContent = [];

RegExp.escape = function (str) {
	return String(str).replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};

gulp.task('getCompiledContent', function (done) {
	var request = http.request({
		host: 'email',
		path: curDirectory.replace(projectDirectory, '').replace(/\\/g, '/') + '/index.html?testData=false'
	});

	request.on('response', function (res) {
		res.on('data', function (chunk) {
			html += chunk;
		});

		res.on('end', function () {
			console.log('Retrieved Content');
			done();
		});
	});

	request.on('error', function (e) {
		console.log('error', e.message);
	});

	request.end();
});

gulp.task('parseContent', ['getCompiledContent'], function (done) {
	jsdom.env({
		html: html,
		scripts: ['http://code.jquery.com/jquery.js'],
		done: function (err, window) {
			var $ = window.$, parsedHTML = '';

			//Remove toolbar
			$('#toolbar').remove();

			//Remove all script tags.
			$('script').remove();

			//Uncomment O2 expression comments
			parsedHTML = window.document.documentElement.outerHTML;

			parsedHTML = parsedHTML.replace(/<!--O2\[(.*?)\]-->/g, "$1\n");
			parsedHTML = parsedHTML.replace(/<!--Test\[(.*?)\]-->\n/g, "");
			parsedHTML = parsedHTML.replace(/data-o2="(.*?)"/g, "$1");
			parsedHTML = parsedHTML.replace(/data-o2-href="(.*?)"/g, "href=\"$1\"");
			parsedHTML = parsedHTML.replace(/data-o2-href='(.*?)'/g, "href='$1'");

			parsedHTML = parsedHTML.replace(/\%22/g, '"');
			parsedHTML = parsedHTML.replace(/\%20/g, ' ');

			parsedHTML = parsedHTML.replace("<html", '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">' + "\n" + '<html')

			outputContent['index'] = parsedHTML;

			window.close();

			console.log('Parsed Content');

			done();
		}
	});
});

gulp.task('splitContent', ['parseContent'], function (done) {
	var subContentMatch = outputContent['index'].match(/<!--Start: (.*?)-->/g);

	if(subContentMatch !== null) {
		subContentMatch.forEach(function (item) {
			var m = item.match(/<!--Start: (.*?)-->/);

			var start = outputContent['index'].indexOf("<!--Start: " + m[1] + "-->") + 14 + m[1].length;
			var end = outputContent['index'].indexOf("<!--End: " + m[1] + "-->");

			outputContent['index'].substr(start, end - start);

			outputContent[m[1]] = outputContent['index'].substr(start, end - start);

			var regExp = new RegExp("<!--Start: " + RegExp.escape(m[1]) + "-->([\\w\\W]*)<!--End: " + RegExp.escape(m[1]) + "-->", "gm");

			outputContent['index'] = outputContent['index'].replace(regExp, "");
		});
	}

	console.log('Split Content');

	done();
});

gulp.task('writeContent', ['splitContent'], function (done) {
	mkdirp('./dest', function (e) {
		if (e) {
			console.error(e);
		}
		else {
			for(var filename in outputContent) {
				fs.writeFile("./dest/" + filename + ".htm", outputContent[filename], function (err) {
					if (err) {
						return console.log(err);
					}

					//console.log("The file (./dest/" + filename + ".htm) was saved!");
				});
			}
		}

		done();
	});
});

gulp.task('build', ['writeContent'], function () {
	console.log('Build Complete');
});

gulp.start('build');