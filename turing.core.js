/*!
 * Turing Core
 * Copyright (C) 2010-2011 Alex R. Young
 * MIT Licensed
 */

/**
 * The core Turing module.
 */
(function(global) {
  var middleware = [], turing, modules = {};

  /**
   * The turing object.  Use `turing('selector')` for quick DOM access when built with the DOM module.
   *
   * @returns {Object} The turing object, run through `init`
   */
  turing = function() {
    var result, i;
    for (i = 0; i < middleware.length; i++) {
      result = middleware[i].apply(turing, arguments);
      if (result) {
        return result;
      }
    }
  }

  turing.VERSION = '0.0.90';
  turing.lesson = 'Part 90: AMD';

  /**
   * This alias will be used as an alternative to `turing()`.
   * If `__turing_alias` is present in the global scope this will be used instead. 
   * 
   */
  if (typeof window !== 'undefined') {
    turing.alias = window.__turing_alias || '$t';
    window[turing.alias] = turing;
  }

  /**
   * Determine if an object is an `Array`.
   *
   * @param {Object} object An object that may or may not be an array
   * @returns {Boolean} True if the parameter is an array
   */
  turing.isArray = Array.isArray || function(object) {
    return !!(object && object.concat
              && object.unshift && !object.callee);
  };

  /**
   * Convert an `Array`-like collection into an `Array`.
   *
   * @param {Object} collection A collection of items that responds to length
   * @returns {Array} An `Array` of items
   */
  turing.toArray = function(collection) {
    var results = [], i;
    for (i = 0; i < collection.length; i++) {
      results.push(collection[i]);
    }
    return results;
  };

  // This can be overriden by libraries that extend turing(...)
  turing.init = function(fn) {
    middleware.unshift(fn);
  };

  /**
   * Determines if an object is a `Number`.
   *
   * @param {Object} object A value to test
   * @returns {Boolean} True if the object is a Number
   */
  turing.isNumber = function(object) {
    return (object === +object) || (toString.call(object) === '[object Number]');
  };

  /**
   * Binds a function to an object.
   *
   * @param {Function} fn A function
   * @param {Object} object An object to bind to
   * @returns {Function} A rebound method
   */
  turing.bind = function(fn, object) {
    var slice = Array.prototype.slice,
        args  = slice.apply(arguments, [2]);
    return function() {
      return fn.apply(object || {}, args.concat(slice.apply(arguments)));
    };
  };

  var testCache = {},
      detectionTests = {};

  /**
   * Used to add feature-detection methods.
   *
   * @param {String} name The name of the test
   * @param {Function} fn The function that performs the test
   */
  turing.addDetectionTest = function(name, fn) {
    if (!detectionTests[name]) {
      detectionTests[name] = fn;
    }
  };

  /**
   * Run a feature detection name.
   *
   * @param {String} name The name of the test
   * @returns {Boolean} The outcome of the test
   */
  turing.detect = function(testName) {
    if (typeof testCache[testCache] === 'undefined') {
      testCache[testName] = detectionTests[testName]();
    }
    return testCache[testName];
  };

  turing.define = function(module, dependencies, fn) {
    if (typeof define === 'function' && define.amd) {
      define(module, dependencies, fn);
    } else {
      if (dependencies && dependencies.length) {
        for (var i = 0; i < dependencies.length; i++) {
          dependencies[i] = modules[dependencies[i]];
        }
      }
      modules[module] = fn.apply(this, dependencies || []);
    }
  };

  /**
   * Export `turing` based on environment.
   */
  global.turing = turing;

  if (typeof exports !== 'undefined') {
    exports.turing = turing;
  }

  turing.define('turing.core', [], function() { return turing; } );

  if (typeof define === 'undefined') {
    global.define = turing.define;
  }
}(typeof window === 'undefined' ? this : window));
