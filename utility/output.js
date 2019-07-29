'use strict';
const Promisie = require('promisie');
const generateOutput = require('@digifi-los/output');

/**
 * 
 * Compiles Output segment configurations
 * 
 * @param {[Object]} segments output segments
 * @param {[Object]} segments.ruleset array of output rules to evaluate
 * @param {[Object]} segments.condition array of population rules to evaluate
 * @param {string} module_name name of the Output module
 * @return {Promise} Returns promise that resolves to an array of Output segment evaluators.
 */
var compileOutputSegmentEvaluations = function (segments, module_name) {
  return Promisie.map(segments, segment => {
    segment.sync = true;
    
    return generateOutput({ segments: segment, module_name, })
      .try(evaluator => {
        let _segment = Object.assign({}, segment._doc, { evaluator, });
        _segment.name = segment.name.replace(/^(.+)(\.v\d{1,2}(.\d{1,2}){0,2}.*)$/, '$1');
        _segment.conditions = segment.conditions || [];
        return _segment;
      })
      .catch(e => Promisie.reject(e));
  });
};

module.exports = compileOutputSegmentEvaluations;
