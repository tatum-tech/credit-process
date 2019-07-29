'use strict';
const Promisie = require('promisie');
const generateAssignments = require('@digifi-los/assignments');

/**
 * 
 * Compiles Assignments segment configurations
 * 
 * @param {[Object]} segments assignments segments
 * @param {[Object]} segments.ruleset array of output variables to be assigned in the assignments module
 * @param {string} module_name name of the Assignments module
 * @return {Promise} Returns promise that resolves to an array of Assignments segment evaluators.
 */
var compileAssignmentsSegmentEvaluations = function (segments, module_name) {
  return Promisie.map(segments, segment => {
    segment.sync = true;
    segment.variables = segment.ruleset || [];
    return generateAssignments({ segments: segment, module_name, })
      .try(evaluator => {
        let _segment = Object.assign({}, segment._doc, { evaluator });
        _segment.name = segment.name.replace(/^(.+)(\.v\d{1,2}(.\d{1,2}){0,2}.*)$/, '$1');
        _segment.conditions = segment.conditions || [];
        return _segment;
      })
      .catch(e => Promisie.reject(e));
  });
};

module.exports = compileAssignmentsSegmentEvaluations;