'use strict';
const Promisie = require('promisie');
const path = require('path');
const strategyLoader = require(path.join(__dirname, './lib/strategy'));

var collections;
var logger;
var credit_pipelines;

/**
 * 
 * Loads Compiled Strategies
 * 
 * @param {Object.<string, *>} query query to load compiled strategy
 * @return {Promise} Returns Promise that resolves to loaded compiled strategies
 */
var load_strategies = function (query = { active: true, }) {
  let Strategy = collections.get('standard_compiledstrategy');
  return Strategy.query({
    query,
  });
};

/**
 * 
 * Given compiled strategy configuration, builds the credit pipeline
 * 
 * @param {Object} engine loaded compiled strategy 
 * @return {Promise} Returns promise that resolves to a function that takes a state and evaluates the credit pipline
 */
var load_pipeline = function (engine) {
  let pipeline = [];
  return strategyLoader(engine)
    .then(credit_pipeline => {
      return pipeline.concat(credit_pipeline);
    })
    .then(pipe => {
      if (pipe && pipe.length) {
        return Promisie.pipe(pipe);
      } else {
        return false;
      }
    })
    .then(_pipeline => {
      return function (state) {
        if (_pipeline) {
          return _pipeline(state)
            .then(result => {
              let output_variables = Object.assign({}, result.calculated_variables, result.output_variables, result.scorecard_variables, result.assignment_variables, result.artificialintelligence_variables, result.dataintegration_variables);
              let output_keys = Object.keys(output_variables);
              output_keys.forEach(key => {
                output_variables[key] = result[key]
              })
              let input_variables = {};
              let protectedVars = { strategy_status: true, passed: true, };
              Object.keys(result).forEach(key => {
                if ((result[key] === null || typeof result[ key ] !== 'object') && output_variables[ key ] === undefined && !protectedVars[ key ]) input_variables[ key ] = result[ key ];
              })

              input_variables = Object.assign({}, input_variables);
              const data_sources = [];
              if (result.datasources) {
                Object.keys(result.datasources).forEach(ds => {
                  const di = result.datasources[ ds ];
                  const obj = {
                    name: di.name,
                    provider: di.provider,
                    data: di.raw,
                  };
                  data_sources.push(obj)
                });
              }
              return Object.assign({}, {
                passed: (result.passed !== undefined) ? result.passed : true,
                decline_reasons: result.decline_reasons || [],
                input_variables: input_variables,
                output_variables: output_variables,
                processing_detail: result.credit_process,
                data_sources,
              });
            })
            .catch(e => {
              let output_variables = Object.assign({}, e.calculated_variables, e.output_variables, e.scorecard_variables, e.assignment_variables, e.artificialintelligence_variables, e.dataintegration_variables);
              let output_keys = Object.keys(output_variables);
              output_keys.forEach(key => {
                output_variables[key] = e[key]
              })
              let protectedVars = { 'decline_reasons': true, 'credit_process': true, passed: true, strategy_status: true, error: true, message: true, calculated_variables: true, output_variables: true, scorecard_variables: true, assignment_variables: true, artificialintelligence_variables: true, dataintegration_variables: true, }
              let input_variables = {};
              Object.keys(e).forEach(key => {
                if (protectedVars && !protectedVars[ key ] && output_variables[ key ] === undefined) {
                  input_variables[ key ] = e[ key ];
                }
              })
              const data_sources = [];
              if (e.datasources) {
                Object.keys(e.datasources).forEach(ds => {
                  const di = e.datasources[ ds ];
                  const obj = {
                    name: di.name,
                    provider: di.provider,
                    data: di.raw,
                  };
                  data_sources.push(obj)
                });
              }
              if (e.message && !e.result) {
                return Object.assign({}, {
                  passed: false,
                  input_variables: input_variables,
                  output_variables: output_variables,
                  processing_detail: e.credit_process,
                  error: e.error,
                  message: e.message,
                  data_sources
                });
              } else {
                return Object.assign({}, {
                  passed: false,
                  decline_reasons: e.decline_reasons,
                  input_variables: input_variables,
                  processing_detail: e.credit_process,
                  output_variables: output_variables,
                  data_sources,
                });
              }
            });
        } else {
          return new Promise((resolve, reject) => {
            resolve(Object.assign({}, {
              passed: true,
              decline_reasons: [],
              input_variables: state,
              output_variables: {},
              processing_detail: [],
              data_sources: [],
            }));
          })
        }
      };
    })
    .catch(e => Promise.reject(e));
};


/**
 * 
 * Given array of engine configurations, will return a function that creates engine pipelines
 * 
 * @param {[Object]} engines array of compiled strategies 
 * @param {Object} options.compiledstrategy a single compiledstrategy configuration object. if this field exists, load_pipeline will use this compiled strategy rather than the array of engines that are passed in.
 * @return {[Promise]} Returns array of promises that resolves to an array of loaded pipeline evaluators
 */
var load_strategy_pipeline = function (engines, options = {}) {
  engines = options.compiledstrategy ? [ options.compiledstrategy, ] : engines;
  let operations = engines.reduce((result, engine) => {
    result[ engine.name.replace(/^(.+)(\.v\d{1,2}(.\d{1,2}){0,2}.*)$/, '$1') ] = function () {
      return load_pipeline(engine)
        .then(evaluator => {
          return { evaluator, organization: engine.organization, };
        })
        .catch(e => Promisie.reject(e));
    };
    return result;
  }, {});
  return Promisie.parallel(operations);
};

/**
 * 
 * Creates an array of pipeline loading functions
 * 
 * @param {Object} query Query to be used to load compiled strategies
 * @param {Object} options options to be used to load compiled strategies
 * @return {Promise} Returns pipieline for loading the strategy and creating the strategy pipeline function 
 */
var load_credit_pipelines = function (query, options) {
  let configuration_pipe = (options.compiledstrategy) ? Promisie.pipe([ load_strategy_pipeline, ]) : Promisie.pipe([ load_strategies, load_strategy_pipeline, ]);
  return configuration_pipe(query, options);
};

/**
 * 
 * Wrapper function for loading the credit pipelines
 * 
 * @param {Object} query Query to be used to load compiled strategies
 * @param {bool} force if false will reload the pipelines instead of using the already existing pipelines
 * @param {Object} options options to be used to load compiled strategies
 * @return {Promise} Returns promise that loads the credit pipelines
 */
var stageCreditPipelines = function (query, force = false, options = {}) {
  if (!credit_pipelines || force) {
    return load_credit_pipelines(query, options)
      .then(initialized => {
        credit_pipelines = initialized;
        return credit_pipelines;
      })
      .catch(e => Promise.reject(e));
  }
  return Promise.resolve(credit_pipelines);
};

var initialize = function (resources) {
  collections = resources.datas;
  logger = resources.logger;
  return stageCreditPipelines;
};

module.exports = {
  initialize,
  stageCreditPipelines,
  load_credit_pipelines,
  load_strategy_pipeline,
  load_pipeline,
};
