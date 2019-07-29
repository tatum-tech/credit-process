'use strict';
const Promisie = require('promisie');
const generateRequirements = require('@digifi-los/requirements');

/**
 * 
 * Compiles Requirements segment configurations
 * 
 * @param {[Object]} segments requirements segments
 * @param {[Object]} segments.ruleset array of requirements rules to evaluate
 * @param {[Object]} segments.condition array of population rules to evaluate
 * @param {string} module_name name of the Requirements module
 * @return {Promise} Returns promise that resolves to an array of Requirements segment evaluators.
 */
var compileRequirementsSegmentEvaluations = function (segments, module_name) {
  return Promisie.map(segments, segment => {
    segment.sync = true;
    return generateRequirements({ segments: segment, module_name, })
      .try(evaluator => {
        let _segment = Object.assign({}, segment._doc, { evaluator, });
        _segment.name = segment.name.replace(/^(.+)(\.v\d{1,2}(.\d{1,2}){0,2}.*)$/, '$1');
        _segment.conditions = segment.conditions || [];
        return _segment;
      })
      .catch(e => Promisie.reject(e));
  });
};

module.exports = compileRequirementsSegmentEvaluations;