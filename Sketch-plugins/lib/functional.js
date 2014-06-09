/**
 * Funktional helper methods simmilar to
 * underscore.js or low_dash.js
 *
 * @type {Object}
 */
var _ = {};

_.breaker = {};

_.has = function(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
};

_.identity = function(value) {
    return value;
};

_.a = function (array, wrap) {
  if (typeof array.length === "number") {
    return array;
  }

  if (array.className() == 'MSArray') {
    array = array.array();
  }

  var result = [];
  var enumerator = array.objectEnumerator(),
    ele = {};

  ele = enumerator.nextObject();
  while (ele) {
    if (ele.className().toString().indexOf("String") !== -1) {
      ele = ele.toString();
    }

    // wrap the element if wrap is true
    if (wrap !== undefined && wrap && typeof $ !== "undefined") {
      ele = $(ele);
    }

    result.push(ele);
    ele = enumerator.nextObject();
  }

  return result;
};

_.each = _.forEach = function (obj, iterator, context) {
  _.a(obj).forEach(iterator, context);
};

_.any = function(obj, iterator, context) {
    if (!iterator) {
        iterator = _.identity;
    }
    var result = false;
    if (obj === null) {
        return result;
    }
    if (typeof context === "undefined") {
        context = obj;
    }
    _.each(obj, function(value, index, list) {
        if (result || (result = iterator.call(context, value, index, list))) {
            return _.breaker;
        }
    });
    return !!result;
};

_.find = function(obj, iterator, context) {
    var result;
    if (typeof context === "undefined") {
        context = obj;
    }
    _.any(obj, function(value, index, list) {
        if (iterator.call(context, value, index, list)) {
            result = value;
            return true;
        }
    });
    return result;
};

_.filter = function(obj, iterator, context) {
    var results = [];
    if (obj === null) {
        return results;
    }
    if (typeof context === "undefined") {
        context = obj;
    }
    _.each(obj, function(value, index, list) {
        if (iterator.call(context, value, index, list)) {
            results[results.length] = value;
        }
    });
    return results;
};

_.extend = function (obj) {
  _.each(Array.prototype.slice.call(arguments, 1), function (source) {
    var prop;

    if (source) {
      for (prop in source) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

/**
 * Test for a Sketch element
 *
 * MSLayerGroup, MSShapeGroup, MSShapes, MSShapePathLayer, MSTextLayer
 *
 * First check if the element has the "className" property. Alle
 * Sketch elements have this property, JavaScript elemnts don't.
 * Second check if the className contains "MS" and either
 * "Shape" or "Layer".
 *
 * "MSSlice", "MSPage" and "MSArtboard" elements are excluded.
 *
 * @param  {mixed}  obj The element to test
 * @return {Boolean}    True if the element is a Sketch element
 */
_.isSketchElement = function (obj) {
  var result = false,
    className;

  if (obj.hasOwnProperty("className")) {
    className = "" + obj.className();
    if (className.indexOf("MS") !== -1 &&
        (className.indexOf("Shape") !== -1 || className.indexOf("Layer") !== -1)) {
      result = true;
    }
  }

  return result;
};
