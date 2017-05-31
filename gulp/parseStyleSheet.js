var gulp = require('gulp');
var fs = require('fs');
var g = require('gulp-load-plugins')();

var through = require("through2");
var rework = require("rework");
var split = require("rework-split-media");
var reworkMoveMedia = require("rework-move-media");
var stringify = require("css-stringify");
var cleanUpString = require("clean-up-string");
var dirname = require("path").dirname;
var pathjoin = require("path").join;
var gutil = require('gulp-util');

gulp.task('parseStyleSheet', function () {
	gulp.src('./css/quest-software.css')
	 .pipe(g.stripCssComments())
	 .pipe(extractMediaQueries())
	 .pipe(gulp.dest('./css/dest/quest-software'));

	gulp.src('./css/one-identity.css')
	 .pipe(g.stripCssComments())
	 .pipe(extractMediaQueries())
	 .pipe(gulp.dest('./css/dest/one-identity'));
});

function extractMediaQueries() {
	return through.obj(function (file, enc, callback) {
		var stream = this;
		var poop = file.clone({
			contents: false
		});
		var reworkData = rework(file.contents.toString()).use(reworkMoveMedia());
		var stylesheets = split(reworkData);
		var stylesheetKeys = Object.keys(stylesheets);
		var styles = ['',''];
		var html = '';

		stylesheetKeys.forEach(function (key) {
			var contents = stringify(stylesheets[key]);

			if (key != '') {
				styles[0] += '@media ' + key + ' {' + "\n" + contents + "\n}\n";
			}
			else {
				contents = contents.replace('@charset "UTF-8";', '');
				styles[1] += contents;
			}
		});

		poop.path = pathjoin(dirname(file.path), 'index.htm');

		styles.forEach(function(content, key) {
			if(key == 0) {
				html += '<style type="text/css" data-exclude="0">' + "\n";
				html += content;
				html += '</style>' + "\n";
			}
			else {
				html += '<style type="text/css" data-exclude="1">' + "\n";
				html += content;
				html += "\n" + '</style>' + "\n";
			}
		});

		poop.contents = new Buffer(html);
		stream.push(poop);

		callback();
	});
}