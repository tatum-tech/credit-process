'use strict';
const Promisie = require('promisie');
const generateCalculations = require('@digifi-los/calculations');

/**
 * 
 * Compiles Calculations segment configurations
 * 
 * @param {[Object]} segments calculations segments
 * @param {[Object]} segments.ruleset array of output variables to be assigned in the calculations module
 * @param {string} module_name name of the Calculations module
 * @return {Promise} Returns promise that resolves to an array of Calculations segment evaluators.
 */
var compileCalculationsSegmentEvaluations = function (segments, module_name) {
  return Promisie.map(segments, segment => {
    segment.sync = true;
    segment.variables = segment.ruleset || [];
    return generateCalculations({ segments: segment, module_name, })
      .try(evaluator => {
        let _segment = Object.assign({}, segment._doc, { evaluator });
        _segment.name = segment.name.replace(/^(.+)(\.v\d{1,2}(.\d{1,2}){0,2}.*)$/, '$1');
        _segment.conditions = segment.conditions || [];
        return _segment;
      })
      .catch(e => Promisie.reject(e));
  });
};

module.exports = compileCalculationsSegmentEvaluations;