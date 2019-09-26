'use strict';
const Promisie = require('promisie');
const path = require('path');
const periodic = require('periodicjs');
const AWS = require('aws-sdk');
// const packagecloud_settings = periodic.settings.extensions[ 'periodicjs.ext.packagecloud' ].client;
const segmentutility = require(path.join(__dirname, './segments')).compileSegments;
const assignments = require(path.join(__dirname, '../utility/assignments'));
const calculations = require(path.join(__dirname, '../utility/calculations'));
const requirements = require(path.join(__dirname, '../utility/requirements'));
const scorecard = require(path.join(__dirname, '../utility/scorecard'));
const output = require(path.join(__dirname, '../utility/output'));
const dataintegration = require(path.join(__dirname, '../utility/dataintegration'));
const artificialintelligence = require(path.join(__dirname, '../utility/artificialintelligence'));
const SM = require(path.join(__dirname, '../utility/state_manager'));
let machinelearning;

const GENERATE = {
  calculations: function (options = {}) {
    let { segments, module_name, module_display_name } = options;
    if (Array.isArray(segments) && segments.length) {
      return calculations(segments, module_name)
        .try(segmentutility.bind(null, 'calculations', module_name))
        .then(calculation_segments => {
          return [ calculation_segments, SM.updateState(module_name, 'calculations', module_display_name), ];
        })
        .catch(e => Promise.reject(e));
    }
  },
  assignments: function (options = {}) {
    let { segments, module_name, module_display_name } = options;
    if (Array.isArray(segments) && segments.length) {
      return assignments(segments, module_name)
        .try(segmentutility.bind(null, 'assignments', module_name))
        .then(assignments_segments => {
          return [ assignments_segments, SM.updateState(module_name, 'assignments', module_display_name), ];
        })
        .catch(e => Promise.reject(e));
    }
  },
  requirements: function (options = {}) {
    let { segments, module_name, module_display_name } = options;
    if (Array.isArray(segments) && segments.length) {
      return requirements(segments, module_name)
        .try(segmentutility.bind(null, 'requirements', module_name))
        .then(requirements_segments => {
          return [ requirements_segments, SM.updateState(module_name, 'requirements', module_display_name), ];
        })
        .catch(e => Promise.reject(e));
    }
  },
  scorecard: function (options = {}) {
    let { segments, module_name, module_display_name } = options;
    if (Array.isArray(segments) && segments.length) {
      return scorecard(segments, module_name)
        .try(segmentutility.bind(null, 'scorecard', module_name))
        .then(scorecard_segments => {
          return [ scorecard_segments, SM.updateState(module_name, 'scorecard', module_display_name), ];
        })
        .catch(e => Promise.reject(e));
    }
  },
  output: function (options = {}) {
    let { segments, module_name, module_display_name } = options;
    if (Array.isArray(segments) && segments.length) {
      return output(segments, module_name)
        .try(segmentutility.bind(null, 'output', module_name))
        .then(output_segments => {
          return [ output_segments, SM.updateState(module_name, 'output', module_display_name), ];
        })
        .catch(e => Promise.reject(e));
    }
  },
  dataintegration: function (options = {}) {
    let { segments, module_name, integration, input_variables, output_variables, module_display_name } = options;
    if (Array.isArray(segments) && segments.length) {
      return dataintegration(segments, module_name, integration, input_variables, output_variables)
        .try(segmentutility.bind(null, 'dataintegration', module_name))
        .then(dataintegration_segments => {
          return [ dataintegration_segments, SM.updateState(module_name, 'dataintegration', module_display_name), ];
        })
        .catch(e => Promise.reject(e));
    }
  },
  artificialintelligence: function (options = {}) {
    let { segments, module_name, machinelearning, module_display_name } = options;
    if (Array.isArray(segments) && segments.length) {
      return artificialintelligence(segments, module_name, machinelearning)
        .try(segmentutility.bind(null, 'artificialintelligence', module_name))
        .then(artificialintelligence_segments => {
          return [ artificialintelligence_segments, SM.updateState(module_name, 'artificialintelligence', module_display_name), ];
        })
        .catch(e => Promise.reject(e));
    }
  },
};


/**
 * 
  * Stages the credit pipeline based on the type of the module given.
  * @param {Object} operation An object containing evaluation functions for each segment types
  * @param {Array} operation.requirements An array of requirements evaluation functions
  * @param {Array} operation.scorecard An array of scorecard evaluation functions
  * @param {Array} operation.output An array of output evaluation functions
  * @param {Array} operation.calculations An array of calculations evaluation functions
  * @param {Array} operation.assignments An array of assignments evaluation functions
  * @param {Array} operation.dataintegration An array of dataintegration evaluation functions
  * @param {Array} operation.textmessage An array of textmessage evaluation functions
  * @param {Array} operation.email An array of email evaluation functions
  * @param {Array} operation.artificialintelligence An array of artificialintelligence evaluation functions
  * @return {Function[]|Promise} Returns an array of credit pipeline functions
 */
var createCreditPipeline = function (operations) {
  try {
    let keys = Object.keys(operations);
    return keys.reduce((pipeline, segment) => {
      if (segment) pipeline = pipeline.concat(operations[ segment ]);
      return pipeline;
    }, []);
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * 
 * @param {Object} options options for compiling the credit engine
 * @param {[Object]} options.module_run_order array of modules configurations
 * @param {[Object]} options.input_variables array of populated input variables
 * @param {[Object]} options.out_variables array of populated out variables
 * @return {Promise} Returns promise that resolves to a loaded pipeline function
 */
var compileCreditEngine = function (options = {}) {
  if (!machinelearning && periodic.settings.container && periodic.settings.container[ 'decision-engine-service-container' ] && periodic.settings.container[ 'decision-engine-service-container' ].machinelearning) {
    let aws_configs = periodic.settings.container[ 'decision-engine-service-container' ].machinelearning;
    AWS.config.update({ region: aws_configs.region, });
    AWS.config.credentials = new AWS.Credentials(aws_configs.key, aws_configs.secret, null);
    machinelearning = new AWS.MachineLearning();
  }
  // let s3 = new AWS.S3({ accessKeyId: packagecloud_settings.accessKeyId, secretAccessKey: packagecloud_settings.accessKey, region: packagecloud_settings.region, });
  let operations = options.module_run_order.reduce((result, key) => {
    result[ `${key.lookup_name}_evaluation` ] = GENERATE[ key.type ].bind(null, { segments: key.segments, module_name: key.name, integration: key.dataintegration, machinelearning, module_display_name: key.display_name, input_variables: options.input_variables, output_variables: options.output_variables, });
    return result;
  }, {});
  return Promisie.parallel(operations)
    .then(result => {
      return createCreditPipeline(result);
    })
    .catch(e => Promisie.reject(e));
};

module.exports = compileCreditEngine;
