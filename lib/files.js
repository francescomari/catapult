'use strict';

var path = require('path');
var express = require('express');

// Serve static files from the 'files/' directory of the application. If the request doesn't match
// any static file, the control is passed to subsequent middleware.

module.exports = function (root) {
  return express.static(path.resolve(root, 'files'));
};
