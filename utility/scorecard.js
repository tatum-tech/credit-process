'use strict';
const Promisie = require('promisie');
const generateScorecard = require('@digifi-los/scorecard');

/**
 * 
 * Compiles Scorecard segment configurations
 * 
 * @param {[Object]} segments scorecard segments
 * @param {[Object]} segments.ruleset array of scorecard rules to evaluate
 * @param {[Object]} segments.condition array of population rules to evaluate
 * @param {string} module_name name of the Scorecard module
 * @return {Promise} Returns promise that resolves to an array of Scorecard segment evaluators.
 */
var compileScorecardSegmentEvaluations = function (segments, module_name) {
  return Promisie.map(segments, segment => {
    segment.sync = true;
    
    return generateScorecard({ segments: segment, module_name, })
      .try(evaluator => {
        let _segment = Object.assign({}, segment._doc, { evaluator, });
        _segment.name = segment.name.replace(/^(.+)(\.v\d{1,2}(.\d{1,2}){0,2}.*)$/, '$1');
        _segment.conditions = segment.conditions || [];
        return _segment;
      })
      .catch(e => Promisie.reject(e));
  });
};

module.exports = compileScorecardSegmentEvaluations;