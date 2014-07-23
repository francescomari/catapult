'use strict';

// Render a script. The script must have been already loaded by some other middleware executed
// before this one.

module.exports = function (root) {
  return function (request, response, next) {
    var catapult = request.catapult;

    if (!catapult) {
      return new Error('catapult namespace is not available');
    }

    var script = catapult.script;

    if (!script) {
      return next(new Error('script is not available'));
    }

    script(request, response, next);
  };
};
