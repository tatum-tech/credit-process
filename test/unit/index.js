'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const sinon = require('sinon');
const vm = require('vm');
const expect = chai.expect;
const util = require('util');
const Promisie = require('promisie');
chai.use(require('sinon-chai'));
const credit = require('../../credit');
const main = require('../../index');
const { SAMPLE_ENGINE, INVALID_ENGINE, NO_MATCHING_SEGMENT } = require('../mocks');

let resources = {
  datas: {},
  logger: {},
};

function underwriting(engines = [ SAMPLE_ENGINE ]) {
  return async function (query, force, options) {
    try {
      let loadedPipeline = await credit.load_strategy_pipeline(engines);
      return loadedPipeline;
    } catch (e) {
      return Promisie.reject(e)
    }
  }
}

describe('Index', function () {
  describe('generateCreditSegments', async () => {
    it('should return a segment evaluator function', async function () {
      let { loadCreditEvaluation, generateCreditSegments, } = main.call({ underwriting: underwriting() }, resources);
      let result = await generateCreditSegments({}, true);
      expect(result).to.be.a('function');
    });
    it('should handle rejection from loading the pipeline', async function () {
      try {
        let { loadCreditEvaluation, generateCreditSegments, } = main.call({ underwriting: underwriting([ INVALID_ENGINE ]) }, resources);
        let result = await generateCreditSegments({}, true);
        throw new Error('should not get in here');
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.equal('ERROR: pipe can only be called with functions - argument 0: undefined');
      }
    });
  });
});

