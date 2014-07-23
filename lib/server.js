'use strict';

var express = require('express');
var morgan = require('morgan');

var catapult = require('./catapult');

// Starts a server. The supported options are:
// 
// - root: this is the root path of the application to serve. This option is mandatory. No default
//   value is provided for this option.
//   
// - port: the port that the server will listen at. This option is mandatory. No default value is
//   provided for this option.

module.exports = function (options) {
  var settings = options || {};

  var root = settings.root;
  var port = settings.port;

  var app = express();

  app.use(morgan('dev'));

  app.all('*', catapult(root));

  app.listen(port);
};
