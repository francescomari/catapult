'use strict';

// Decompose a path into content path, selectors, extension and suffix. The path is saved in the
// request to be used by subsequent middleware.

module.exports = function () {
  return function (request, response, next) {
    request.catapult = request.catapult || {};

    request.catapult.pathInfo = getPathInfo(request.path);

    next();
  };
};

function getPathInfo(path) {
  var pathInfo = {};

  pathInfo.path = path;
  pathInfo.selectors = [];
  pathInfo.extension = null;
  pathInfo.suffix = null;
  pathInfo.original = path;

  var dot = path.indexOf('.');

  if (dot < 0) {
    return pathInfo;
  }

  pathInfo.path = path.slice(0, dot);

  var slash = path.indexOf('/', dot);

  var selectorsExtension;

  if (slash < 0) {
    selectorsExtension = path.slice(dot + 1);
  }
  else {
    selectorsExtension = path.slice(dot + 1, slash);
  }

  var splitted = selectorsExtension.split('.').filter(nonEmpty);

  function nonEmpty(s) {
    return s.length > 0;
  }

  pathInfo.extension = splitted.pop() || null;
  pathInfo.selectors = splitted;

  if (slash >= 0) {
    pathInfo.suffix = path.slice(slash);
  }

  return pathInfo;
}
