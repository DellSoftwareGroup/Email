'use strict';

var gulp = require('gulp');
var http = require('http');
var jsdom = require('jsdom');
var fs = require('fs');
var html = '';

gulp.task('getCompiledContent', function(done) {
	var request = http.request({
		host: 'email',
		path: '/emails/inbound-sonicwall/index.html'
	});

	request.on('response', function(res) {
		res.on('data', function(chunk) {
			html += chunk;
		});

		res.on('end', function() {
			done();
		});
	});

	request.on('error', function(e) {
		console.log('error', e.message);
	});

	request.end();
});

gulp.task('parseContent', ['getCompiledContent'], function(done) {
	console.log('parseContent complete');

	var parsedHTML = '';

	jsdom.env({
		html: html,
		scripts: ['http://code.jquery.com/jquery.js'],
		done: function(err, window) {
			var $ = window.$;
			var o2Var = {};

			//Remove toolbar
			$('#toolbar').remove();

			//Find O2 Variables
			var m = window.document.documentElement.outerHTML.match(/<!--O2Var\[(.*?)=(.*?)\]-->/g);

			if(m) {
				$.each(m, function(indx, val) {
					var m2 = val.match(/<!--O2Var\[(.*?)=(.*?)\]-->/);

					o2Var[m2[1]] = m2[2];
				});
			}

			// console.log(window);

			/*$('a[data-o2-href]').each(function() {
				var vName = $(this).data('o2-href');

				$(this).attr('href', o2Var[vName]);
			});*/


			//Remove all script tags.
			$('script').remove();

			//Uncomment O2 expression comments
			parsedHTML = window.document.documentElement.outerHTML.replace(/<!--O2\[(.*?)\]-->/g, "$1\n");

			//console.log(parsedHTML);

			html = parsedHTML;

			window.close();

			done();
		}
	});

});

gulp.task('writeContent', ['parseContent'], function() {
	console.log('about to write content');
	fs.writeFile("./output.htm", html, function (err) {
		if (err) {
			return console.log(err);
		}

		console.log("The file was saved!");
	});
});

gulp.task('build', ['writeContent'], function() {
	console.log('build complete');
});

gulp.start('build');