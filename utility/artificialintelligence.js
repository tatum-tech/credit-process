'use strict';
const Promisie = require('promisie');
const generateAI = (process.env.NODE_ENV === 'test') ? require('../test/generator.js').ML.mlGenerator : require('@digifi-los/ml');

/**
 * 
 * Compiles AI segment configurations
 * 
 * @param {[Object]} segments ai segments
 * @param {[Object]} segments.ruleset ai input variables
 * @param {string} module_name name of the AI module
 * @param {Object} machinelearning AWS machinelearning instance
 * @return {Promise} Returns promise that resolves to an array of AI segment evaluators.
 */
var compileAISegmentEvaluations = function (segments, module_name, machinelearning) {
  return Promisie.map(segments, segment => {
    segment.sync = true;
    segment.variables = segment.ruleset || [];
    return generateAI({ segments: segment, module_name, machinelearning, })
      .try(evaluator => {
        let _segment = Object.assign({}, segment._doc, { evaluator, });
        _segment.name = segment.name.replace(/^(.+)(\.v\d{1,2}(.\d{1,2}){0,2}.*)$/, '$1');
        _segment.conditions = segment.conditions || [];
        return _segment;
      })
      .catch(e => Promisie.reject(e));
  });
};

module.exports = compileAISegmentEvaluations;