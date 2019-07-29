'use strict';
const load_segment = require('@digifi-los/segmentloader');
const Promisie = require('promisie');

/**
 * Creates the iterator for the segment evaluators
 * @param {Object} result An object of created segment evaluators indexed by segment name
 * @returns {Function} Returns iterator function that takes the evaluation function that evaluates each segment and returns the valid segment.
 */
var generateSegmentIterator = function (result) {
  let valid = false;
  let index = 0;
  let keys = Object.keys(result);
  /**
   * Iterator function that looks for a segment that evaluates to a truthy value
   * @param {Function} evaluation segment evaluation function that takes key value pair (segment name and its properties) and determines the validity of the segment
   * @return {Object|Boolean} Returns the valid segment that has been found or false if none
   */
  return function* (evaluation) {
    while (index < keys.length && !valid) {
      let current = keys[index++];
      valid = (evaluation(current, result[current])) ? current : false;
      yield evaluation;
    }
    let segment = valid;
    index = 0;
    valid = false;
    return segment;
  };
};

/**
 * 
 * @param {Function} segments loaded segment evaluator function 
 * @param {Function|Boolean} skip_evaluator Function that takes the state and determines whether the segment can be skipped or not. If the returned skippable object contains strict_skip, it means that the segment will only be skipped the segment strictly matches the conditions. Otherwise, segment will always be skipped if truthy
 * @param {string} type type of the segment/module e.g. requirements
 * @returns {Function} Returns a function that takes a state and runs the segment evaluator function
 */
var createSegmentEvaluator = function (segments, skip_evaluator, type) {
  return function segment_evaluator (state, return_evaluator = false) {
    try {
      let _state = Object.assign({}, state);
      let skippable = (typeof skip_evaluator === 'function') ? skip_evaluator(_state) : false;
      let valid = segments(_state);
      if ((!valid || (Array.isArray(valid) && !valid.length)) && !skippable) {
        return _state;
      } else if (skippable && (!valid || (Array.isArray(valid) && !valid.length) || !skippable.strict_skip)) {
        return _state;
      }
      if (valid && return_evaluator === true) {
        if (Array.isArray(valid)) return valid.map(segment => segment.evaluator);
        else return valid.evaluator;
      }
      let evaluations = (Array.isArray(valid)) ? valid.reduce((result, segment) => {
        result[segment.name] = Object.assign(segment.evaluator(_state), { evaluator: segment.evaluator.bind(segment), });
        return result;
      }, {}) : { [ valid.name ]: Object.assign(valid.evaluator(_state), { evaluator: valid.evaluator.bind(valid), }), };
      evaluations[Symbol.iterator] = generateSegmentIterator(evaluations);
      if (_state && _state[type]) _state[type] = Object.assign({}, _state[type], evaluations);
      else _state = Object.assign({}, _state, { [type]: evaluations, });
      return _state;
    } catch (e) {
      return Promisie.reject(e);
    }
  };
};

/**
 * 
 * @param {string} type type of the module e.g. Requirements 
 * @param {Object[]} configurations Array of segment rules
 * @returns {Function} segment evaluator function that takes a state
 */
var compileSegments = function (type, configurations) {
  let _configurations = (Array.isArray(configurations)) ? configurations : [configurations,];
  let skip_evaluator = null;
  let segmentLoader = (this && this.segmentLoader)? this.segmentLoader : load_segment;
  let evaluators = segmentLoader.generateEvaluators(_configurations);
  let segments = segmentLoader.evaluate(evaluators, true);
  return createSegmentEvaluator(segments, skip_evaluator, type);
};

module.exports = {
  generateSegmentIterator,
  createSegmentEvaluator,
  compileSegments,
};