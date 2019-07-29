'use strict';
const CREDIT = require('./credit');
const Promisie = require('promisie');
const SEGMENTS = require('@digifi-los/segmentloader');

var underwriting;
var credit_segments;
var logger;
var segment_query;

/**
 * 
 * Creates decision segments. Wrapper function around the credit pipeline function in the credit.js file
 * 
 * @param {Object} query Query to be used to load compiled strategies
 * @param {bool} force if false will reload the pipelines instead of using the already existing pipelines
 * @param {Object} options options to be used to load compiled strategies
 * @return {Promise} Returns promise that resolves to loaded credit pipelines
 */
var generateCreditSegments = function (query = { active: true, }, force = false, options = {}) {
  if (typeof credit_segments !== 'function' || force) {
    return underwriting(segment_query || query, force, options)
      .then(initialized_engines => {
        return Object.keys(initialized_engines).reduce((result, key) => {
          let evaluator = SEGMENTS.generateEvaluators({ conditions: initialized_engines[ key ].conditions || [], engine: initialized_engines[ key ].evaluator, engine_name: key, organization: initialized_engines[ key ].organization, });
          result[ key ] = evaluator;
          return result;
        }, {})
      })
      .then(initialized_segments => SEGMENTS.evaluate(initialized_segments, true))
      .then(result => {
        credit_segments = result;
        return credit_segments;
      }, e => Promisie.reject(e));
  }
  return Promisie.resolve(credit_segments);
};

/**
 * Asynchronous function called for each credit engine to run the credit pipeline process in parallel
 * @param state The current state of the credit process 
 * @param {Object} [options={}] An object that holds the credit engine details
 * @param {Function} options.engine Function that runs the credit engine pipeline and updates the state of the credit process
 * @param {string} options.engine_name The name of the credit engine
 * @param {Array} options.ids An array of segment ids for the credit engine 
 * @return {Promise.<Object>} Returns a promise that resolves to an object with the engine name and the result of segment evaluations
 */
var asyncEvaluator = function (state, options = {}) {
  return new Promisie((resolve, reject) => {
    let task = setImmediate(() => {
      clearImmediate(task);
      try {
        options.engine(Object.assign({}, state))
          .then(result => {
            let evaluated = { [ options.engine_name ]: Object.assign(result, { segment_ids: options.ids, }), };
            resolve(evaluated);
          }, reject);
      } catch (e) {
        reject(e);
      }
    });
  });
};

var loadCreditEvaluation = function (query = { active: true, }, force = false) {
  return function credit_evaluator(state) {
    return generateCreditSegments(query, force)
      .then(segments => {
        let valid = segments(state);
        if (!valid) {
          return Promise.reject(new Error('ERROR: Could not find valid segment given input data'));
        } else {
          return Promisie.map(valid, segment => asyncEvaluator(state, segment));
        }
      })
      .then(result => {
        let requirements = {};
        let decline_reasons = [];
        result.forEach(seg => {
          if (seg.type && seg.type.toLowerCase() === 'requirements') requirements[ seg.name ] = { passed: seg.passed, };
          decline_reasons = (seg.decline_reasons) ? decline_reasons.concat(seg.decline_reasons) : decline_reasons;
        });

        return Object.assign({}, {
          passed: Object.keys(requirements).every(x => requirements[ x ].passed === true),
          decline_reasons,
          requirements,
          credit_process: result,
        }, result.calculated_variables, result.output_variables);
      })
      .catch(e => {
        return Promisie.reject(e);
      });
  };
};

/**
 * Sets the global variable segment_query that is used to query the Credit Engine collection
 * @param {Object} query The query used to load the credit engines 
 * @return {Object} segment_query Returns the query object that has been set 
 */
var setCreditEngineQuery = function (query) {
  segment_query = query;
};

/**
 * Initializes the module by setting the global variables with properties on the periodic singleton
 * @param {Object} [resources={}] Periodic singleton object
 * @return {Function[]} Returns an object with all the function in this file 
* */
module.exports = function initialize(resources = {}) {
  if (process.env && process.env.NODE_ENV === 'test' && this && this.underwriting) underwriting = this.underwriting;  
  else underwriting = CREDIT.initialize(resources);
  logger = resources.logger;
  return { loadCreditEvaluation, generateCreditSegments, setCreditEngineQuery, };
};
