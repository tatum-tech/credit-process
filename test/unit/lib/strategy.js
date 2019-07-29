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
const credit_engine = require('../../../lib/strategy');

describe('Lib/Strategy', function () {
  describe('generateAssignments', () => {
    it('should return array of compiled assignments segment evaluator functions', async function () {
      let options = {};
      options.module_run_order = [ {
        type: 'assignments',
        module_name: 'assignments_module',
        segments: [ { _doc: {}, conditions: [], name: 'test_segment1', ruleset: [], }, { _doc: {}, name: 'test_segment2', conditions: [], ruleset: [], }]
      }];
      let assignmentsGenerator = credit_engine(options);
      let result = await assignmentsGenerator;
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[ 0 ]).to.be.a('function');
    });
    it('should handle rejection from Promise', async function () {
      try {
        let options = {};
        options.module_run_order = [ {
          type: 'assignments',
          module_name: 'assignments_module',
          segments: [ { _doc: {}, conditions: [],  ruleset: [], }, { _doc: {}, name: 'test_segment2', conditions: [], ruleset: [], }]
        }];
        let assignmentsGenerator = credit_engine(options);
        let result = await assignmentsGenerator;
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.equal('Cannot read property \'replace\' of undefined');
      }
    });
  });
  describe('generateCalculations', () => {
    it('should return array of compiled calculations segment evaluator functions', async function () {
      let options = {};
      options.module_run_order = [ {
        type: 'calculations',
        module_name: 'calculations_module',
        segments: [ { _doc: {}, conditions: [], name: 'test_segment1', ruleset: [], }, { _doc: {}, name: 'test_segment2', conditions: [], ruleset: [], }]
      }];
      let calculationsGenerator = credit_engine(options);
      let result = await calculationsGenerator;
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[ 0 ]).to.be.a('function');
    });
    it('should handle rejection from Promise', async function () {
      try {
        let options = {};
        options.module_run_order = [ {
          type: 'calculations',
          module_name: 'calculations_module',
          segments: [ { _doc: {}, conditions: [],  ruleset: [], }, { _doc: {}, name: 'test_segment2', conditions: [], ruleset: [], }]
        }];
        let calculationsGenerator = credit_engine(options);
        let result = await calculationsGenerator;
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.equal('Cannot read property \'replace\' of undefined');
      }
    });
  });

  describe('generateRequirements', () => {
    it('should return array of compiled requirements segment evaluator functions', async function () {
      let options = {};
      options.module_run_order = [ {
        type: 'requirements',
        module_name: 'requirements_module',
        segments: [ { _doc: {}, conditions: [], name: 'test_segment1', ruleset: [], }, { _doc: {}, name: 'test_segment2', conditions: [], ruleset: [], }]
      }];
      let requirementsGenerator = credit_engine(options);
      let result = await requirementsGenerator;
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[ 0 ]).to.be.a('function');
    });
    it('should handle rejection from Promise', async function () {
      try {
        let options = {};
        options.module_run_order = [ {
          type: 'requirements',
          module_name: 'requirements_module',
          segments: [ { _doc: {}, conditions: [],  ruleset: [], }, { _doc: {}, name: 'test_segment2', conditions: [], ruleset: [], }]
        }];
        let requirementsGenerator = credit_engine(options);
        let result = await requirementsGenerator;
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.equal('Cannot read property \'replace\' of undefined');
      }
    });
  });

  describe('generateScorecard', () => {
    it('should return array of compiled scorecard segment evaluator functions', async function () {
      let options = {};
      options.module_run_order = [ {
        type: 'scorecard',
        module_name: 'scorecard_module',
        segments: [ { _doc: {}, conditions: [], name: 'test_segment1', ruleset: [], }, { _doc: {}, name: 'test_segment2', conditions: [], ruleset: [], }]
      }];
      let scorecardGenerator = credit_engine(options);
      let result = await scorecardGenerator;
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[ 0 ]).to.be.a('function');
    });
    it('should handle rejection from Promise', async function () {
      try {
        let options = {};
        options.module_run_order = [ {
          type: 'scorecard',
          module_name: 'scorecard_module',
          segments: [ { _doc: {}, conditions: [],  ruleset: [], }, { _doc: {}, name: 'test_segment2', conditions: [], ruleset: [], }]
        }];
        let scorecardGenerator = credit_engine(options);
        let result = await scorecardGenerator;
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.equal('Cannot read property \'replace\' of undefined');
      }
    });
  });

  describe('generateOutput', () => {
    it('should return array of compiled output segment evaluator functions', async function () {
      let options = {};
      options.module_run_order = [ {
        type: 'output',
        module_name: 'output_module',
        segments: [ { _doc: {}, conditions: [], name: 'test_segment1', ruleset: [], }, { _doc: {}, name: 'test_segment2', conditions: [], ruleset: [], }]
      }];
      let outputGenerator = credit_engine(options);
      let result = await outputGenerator;
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[ 0 ]).to.be.a('function');
    });
    it('should handle rejection from Promise', async function () {
      try {
        let options = {};
        options.module_run_order = [ {
          type: 'output',
          module_name: 'output_module',
          segments: [ { _doc: {}, conditions: [],  ruleset: [], }, { _doc: {}, name: 'test_segment2', conditions: [], ruleset: [], }]
        }];
        let outputGenerator = credit_engine(options);
        let result = await outputGenerator;
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.equal('Cannot read property \'replace\' of undefined');
      }
    });
  });

  describe('generateDataIntegration', () => {
    it('should return array of compiled dataintegration segment evaluator functions', async function () {
      let options = {};
      options.module_run_order = [ {
        type: 'dataintegration',
        module_name: 'dataintegration_module',
        segments: [ { _doc: {}, conditions: [], name: 'test_segment1', ruleset: [], }, { _doc: {}, name: 'test_segment2', conditions: [], ruleset: [], }]
      }];
      let dataintegrationGenerator = credit_engine(options);
      let result = await dataintegrationGenerator;
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[ 0 ]).to.be.a('function');
    });
    it('should handle rejection from Promise', async function () {
      try {
        let options = {};
        options.module_run_order = [ {
          type: 'dataintegration',
          module_name: 'dataintegration_module',
          segments: [ { _doc: {}, conditions: [],  ruleset: [], }, { _doc: {}, name: 'test_segment2', conditions: [], ruleset: [], }]
        }];
        let dataintegrationGenerator = credit_engine(options);
        let result = await dataintegrationGenerator;
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.equal('Cannot read property \'replace\' of undefined');
      }
    });
  });

  describe('generateArtificialIntelligence', () => {
    it('should return array of compiled artificialintelligence segment evaluator functions', async function () {
      let options = {};
      options.module_run_order = [ {
        type: 'artificialintelligence',
        module_name: 'artificialintelligence_module',
        segments: [ { _doc: {}, conditions: [], name: 'test_segment1', ruleset: [], }, { _doc: {}, name: 'test_segment2', conditions: [], ruleset: [], }]
      }];
      let artificialintelligenceGenerator = credit_engine(options);
      let result = await artificialintelligenceGenerator;
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[ 0 ]).to.be.a('function');
    });
    it('should handle rejection from Promise', async function () {
      try {
        let options = {};
        options.module_run_order = [ {
          type: 'artificialintelligence',
          module_name: 'artificialintelligence_module',
          segments: [ { _doc: {}, conditions: [],  ruleset: [], }, { _doc: {}, name: 'test_segment2', conditions: [], ruleset: [], }]
        }];
        let artificialintelligenceGenerator = credit_engine(options);
        let result = await artificialintelligenceGenerator;
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.equal('Cannot read property \'replace\' of undefined');
      }
    });
  });
});