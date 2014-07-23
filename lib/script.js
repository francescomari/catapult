'use strict';

var fs = require('fs');
var path = require('path');
var consolidate = require('consolidate');

// Load a script from the file system and save it in the request for later usage. This middleware
// recognizes two different kinds of script:
// 
// - renderable scripts: these scripts have an extension different from '.js'. The extension of
//   these scripts is used to obtain a scripting engine through consolidate. The scripting engine
//   will later process the scripts and return a response to the user.
//   
// - executable scripts: these scripts have an extension of 'js'. They are loaded as Node modules,
//   and they are supposed to export a functino (request, response, next), as any piece of 
//   middleware supported by Express. These scripts have full control on the processing of the 
//   content and can do whatever they like.

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

    var content = catapult.content;

    if (!content) {
      return next(new Error('content is not available'));
    }

    var scriptDirectory = getScriptDirectory(root, content.type, pathInfo.selectors, pathInfo.extension);
    
    fs.readdir(scriptDirectory, onNames);

    function onNames(error, names) {
      if (error) {
        return next(new Error('no script found'));
      }

      var requestMethod = request.method.toLowerCase();

      var found = names.filter(isMatching);

      function isMatching(name) {
        var parts = name.split('.');

        if (parts.length !== 2) {
          return false;
        }

        return parts[0].toLowerCase() === requestMethod;
      }

      var count = found.length;

      if (count < 1) {
        return next(new Error('no script found'));
      }

      if (count > 1) {
        return next(new Error('too many scripts found'));
      }

      var scriptName = found[0];

      var scriptPath = path.join(scriptDirectory, scriptName);

      request.catapult.script = createScript(scriptPath);
      
      next();
    }
  };
};

function getScriptDirectory(root, contentType, selectors, extension) {
  var components = [];

  components = components.concat(root);
  components = components.concat('scripts');
  components = components.concat(contentTypeAsFilePath(contentType));
  components = components.concat(selectors);
  components = components.concat(extension || 'default');

  return path.resolve.apply(null, components);
}

function contentTypeAsFilePath(contentType) {
  if (!contentType) {
    return 'default';
  }

  return contentType.replace('/', path.sep);
}

function getScriptBaseName(extension) {
  return extension || 'default';
}

function createScript(scriptPath) {
  var extension = path.extname(scriptPath);

  if (extension === '.js') {
    return createExecutableScript(scriptPath);
  }

  return createRenderableScript(scriptPath);
}

function createExecutableScript(scriptFile) {
  return function (request, response, next) {
    var handler;

    try {
      handler = require(scriptFile);
    }
    catch (e) {
      return next(new Error('unable to load the script'));
    }

    handler(request, response, next);
  };
}

function createRenderableScript(scriptFile) {
  return function (request, response, next) {
    var extension = path.extname(scriptFile).slice(1);

    var engine = consolidate[extension];

    if (!engine) {
      return next(new Error('unable to find the scripting engine'));
    }

    var context = {};

    context.pathInfo = request.catapult.pathInfo;
    context.content = request.catapult.content;

    engine(scriptFile, context, onRendered);

    function onRendered(error, result) {
      if (error) {
        return next('unable to render the script');
      }

      response.send(200, result);
    }
  };
}
