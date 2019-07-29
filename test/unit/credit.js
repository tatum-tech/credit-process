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
const { SAMPLE_ENGINE, INVALID_ENGINE } = require('../mocks');

describe('Credit', function () {
  describe('initialize', () => {
    it('should setup the collections and logger from the periodic instance and return stageCreditPipeline function', () => {
      let datas = new Map();
      datas.set('standard_creditengine', {});
      let result = credit.initialize({
        datas,
        logger: {},
      });
      expect(result).to.be.a('function');
    });
  });
  describe('load_pipeline', () => {
    it('should load the credit engine based on the engine object and return a function that passes the state through the pipeline and returns the updated state', async function () {
      let _state = {
        age: 20,
      };
      let loadedPipeline = await credit.load_pipeline(SAMPLE_ENGINE);
      expect(loadedPipeline).to.be.a('function');
      let pipedResult = await loadedPipeline(_state);
      expect(pipedResult).to.have.all.keys('passed', 'decline_reasons', 'input_variables', 'output_variables', 'processing_detail', 'data_sources');
      expect(pipedResult.passed).to.equal(true);
      expect(pipedResult.processing_detail.length).to.equal(1);
      expect(pipedResult.input_variables.age).to.equal(20);
    });
    it('should handle failure in requirements module', async function(){
      let _state = {
        age: 16,
      };
      let loadedPipeline = await credit.load_pipeline(SAMPLE_ENGINE);
      expect(loadedPipeline).to.be.a('function');
      let pipedResult = await loadedPipeline(_state);
      expect(pipedResult).to.have.all.keys('passed', 'decline_reasons', 'input_variables', 'output_variables', 'data_sources', 'processing_detail');
      expect(pipedResult.passed).to.equal(false);
      expect(pipedResult.processing_detail.length).to.equal(1);
      expect(pipedResult.input_variables.age).to.equal(16);
    });
    it('should handle error in credit process', async function(){
      let _state = {
      };
      let loadedPipeline = await credit.load_pipeline(SAMPLE_ENGINE);
      expect(loadedPipeline).to.be.a('function');
      let pipedResult = await loadedPipeline(_state);
      expect(pipedResult).to.have.all.keys('passed', 'input_variables', 'output_variables', 'processing_detail', 'data_sources', 'error', 'message');
      expect(pipedResult.passed).to.equal(false);
      expect(pipedResult.error.message).to.equal('The Variable age is required by a Rule but is not defined.');
      expect(pipedResult.message).to.equal('Error in requirements module undefined: The Variable age is required by a Rule but is not defined.');
    });
    it('should handle system error', async function () {
      try {
        let loadedPipeline = await credit.load_pipeline(INVALID_ENGINE);
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.equal('ERROR: pipe can only be called with functions - argument 0: undefined');
      }
    });
  });

  describe('load_strategy_pipeline', () => {
    it('should format the options credit engine object and return the loaded credit engine', async function(){
      let loadedPipeline = await credit.load_strategy_pipeline([ SAMPLE_ENGINE ]);
      expect(loadedPipeline).to.have.property('college_application');
      expect(loadedPipeline['college_application']).to.have.property('evaluator');
      expect(loadedPipeline['college_application']).to.have.property('organization');
    });

    it('should reject if error in the loading of the pipeline', async function(){
      try {
        let loadedPipeline = await credit.load_strategy_pipeline([ INVALID_ENGINE ]);
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.equal('ERROR: pipe can only be called with functions - argument 0: undefined');
      }
    });
  });
});