'use strict';

var fs = require('fs');
var path = require('path');

// Load content from a JSON file stored in the file system. If the content path is '/a/b', this
// middleware loads a file at 'content/a/b.json'. If the content does not exist, a 404 response is
// returned.
// 
// The only special case is the root of the web application, which is represented by the 
// 'index.json' file in the main folder of the application. This resource is loaded when a request
// hits the content path '/'.

module.exports = function (root) {
  return function (request, response, next) {
    var catapult = request.catapult;

    if (!catapult) {
      return next(new Error('catapult namespace is not available'));
    }

    var pathInfo = catapult.pathInfo;

    if (!pathInfo) {
      return next(new Error('path info is not available'));
    }

    var filePath = getFilePath(root, pathInfo.path);

    fs.readFile(filePath, {encoding: 'utf8'}, onFile);

    function onFile(error, data) {
      if (error && error.code === 'ENOENT') {
        return response.send(404);
      }

      if (error) {
        return next(error);
      }

      var content;

      try {
        content = JSON.parse(data);
      }
      catch (e) {
        return next(e);
      }

      request.catapult.content = content;

      next();
    }
  };
};

function getFilePath(root, contentPath) {
  if (contentPath === '/') {
    return getRootFilePath(root);
  }

  return getInternalFilePath(root, contentPath);
}

function getRootFilePath(root) {
  return path.resolve(root, 'index.json');
}

function getInternalFilePath(root, contentPath) {
  return path.resolve(root, 'content', toFilePath(contentPath)) + '.json';
}

function toFilePath(contentPath) {
  return contentPath.slice(1).split('/').join(path.sep);
}
