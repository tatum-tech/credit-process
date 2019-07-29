'use strict';
const Promisie = require('promisie');
const generateDataIntegration = (process.env.NODE_ENV === 'test') ? require('../test/generator.js').DI.diGenerator : require('@digifi-los/data-integrations-strategy');

/**
 * 
 * Compiles Data Integration segment configurations
 * 
 * @param {[Object]} segments dataintegration segments
 * @param {[Object]} input_variables array of input variables to be used as parameters to the dataintegration API requests
* @param {[Object]} output_variables array of output variables to assign the result of the API response to
 * @param {Object} integration credentials for the integration
 * @param {string} module_name name of the Data Integration module
 * @return {Promise} Returns promise that resolves to an array of Data Integration segment evaluators.
 */
var compileDataIntegrationSegmentEvaluations = function (segments, module_name, integration, input_variables, output_variables) {
  return Promisie.map(segments, segment => {
    segment.sync = true;
    segment.variables = segment.ruleset || [];
    return generateDataIntegration({ segments: segment, module_name, integration, input_variables, output_variables, })
      .try(evaluator => {
        let _segment = Object.assign({}, segment._doc, { evaluator, });
        _segment.name = segment.name.replace(/^(.+)(\.v\d{1,2}(.\d{1,2}){0,2}.*)$/, '$1');
        _segment.conditions = segment.conditions || [];
        return _segment;
      })
      .catch(e => Promisie.reject(e));
  });
};

module.exports = compileDataIntegrationSegmentEvaluations;