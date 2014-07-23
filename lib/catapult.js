'use strict';

var express = require('express');

var path = require('./path');
var files = require('./files');
var script = require('./script');
var render = require('./render');
var content = require('./content');

// This is the main piece of middleware, which encapsulates every other middleware implemented by
// the framework. Basically, these operations are implemented:
//   - If a request hits a static file, return it.
//   - Decompose the request path in content path, selectors, extension and suffix.
//   - Load content from a JSON file.
//   - Load a script from the file system.
//   - Render the script and return a response.

module.exports = function (root) {
  var app = express();

  app.use(files(root));
  app.use(path(root));
  app.use(content(root));
  app.use(script(root));
  app.all('*', render(root));

  return app;
};
