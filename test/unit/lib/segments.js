'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const sinon = require('sinon');
const vm = require('vm');
const expect = chai.expect;
'use strict';

const util = require('util');
const Promisie = require('promisie');
chai.use(require('sinon-chai'));
const segments = require('../../../lib/segments.js');

describe('Lib/Segments', function () {
  describe('generateSegmentIterator', () => {
    it('should return iterator object for segments', () => {
      let input = {
        scorecard: false,
        requirements: false,
        output: true,
      };
      let getSegments = segments.generateSegmentIterator(input);
      let evaluationFunc = function (key, val) {
        return val;
      };
      let segmentIterator = getSegments(evaluationFunc);
      let result = '';
      while (!result) {
        let currentVal = segmentIterator.next().value;
        if (!(typeof currentVal === 'function')) {
          result = currentVal;
        }
      }
      expect(result).to.equal('output');
    });
  });
  describe('createSegmentEvaluator', () => {
    it('should set up array of segment evaluators for the type on the state', () => {
      let segmentFunc = function (state) {
        let segmentArr = [ { evaluator: (state) => false, name: 'SAT scorecard' }, { evaluator: (state) => true, name: 'ACT scorecard' }];
        if (state.sat) return segmentArr[ 0 ];
        else return segmentArr[ 1 ];
      }
      let skip_evaluator = function () { return false; };
      let segmentEvaluatorCreator = segments.createSegmentEvaluator(segmentFunc, skip_evaluator, 'scorecard', 'module_name');
      let result = segmentEvaluatorCreator({ act: 31 });
      expect(result).to.have.property('scorecard');
      expect(result.scorecard).to.have.property('ACT scorecard');
      expect(result.scorecard[ 'ACT scorecard' ].evaluator).to.be.a('function');
    });
    it('should return the state if no valid segment is given and it is not skippable', () => {
      let segmentFunc = function (state) {
        let segmentArr = [ { evaluator: (state) => false, name: 'SAT scorecard' }, { evaluator: (state) => true, name: 'ACT scorecard' }];
        return [];
      }
      let skip_evaluator = false;
      let _state = { sat: 2100 };
      let segmentEvaluatorCreator = segments.createSegmentEvaluator(segmentFunc, skip_evaluator, 'scorecard', 'module_name');
      let result = segmentEvaluatorCreator({ sat: 2100 })
      expect(result).to.deep.equal(_state);
    });
    it('should return the evaluator function immediately if return_evaluator flag is set to true', () => {
      let segmentFunc = function (state) {
        let segmentArr = [ { evaluator: (state) => false, name: 'SAT scorecard' }, { evaluator: (state) => true, name: 'ACT scorecard' }];
        return segmentArr[ 0 ];
      }
      let skip_evaluator = false;
      let _state = { sat: 2100 };
      let segmentEvaluatorCreator = segments.createSegmentEvaluator(segmentFunc, skip_evaluator, 'scorecard', 'module_name');
      let result = segmentEvaluatorCreator({ sat: 2100 }, true)
      expect(result).to.be.a('function');
    });
    it('should handle any errors in the try catch block', async function () {
      try {
        let segmentFunc = null;
        let skip_evaluator = false;
        let _state = { sat: 2100 };
        let segmentEvaluatorCreator = segments.createSegmentEvaluator(segmentFunc, skip_evaluator, 'scorecard', 'module_name');
        let result = await segmentEvaluatorCreator({ sat: 2100 }, true);
      } catch (e) {
        expect(e).to.be.an('object');
        expect(e.message).to.equal('Error while creating segment evaluator - scorecard module module_name: segments is not a function');
      }
    });
  });
  describe('compileSegments', () => {
    it('should compile segments based on the configurations and return segment evaluator function', () => {
      let evaluationFunc = function(key, val) {
        return val;
      };
      let segmentFunc = function(state) {
        return [];
      };
      let segmentLoader = {
        generateEvaluators: function(configurations) {
          return [evaluationFunc];
        },
        evaluate: function(evaluators) {
          return [ { evaluator: (state) => false, name: 'SAT scorecard' }, { evaluator: (state) => true, name: 'ACT scorecard' }];
        },
      };
      let configurations = {
        conditions: [],
        skip_conditions: [{ skippable: true ,}],
      };
      let result = segments.compileSegments.call({ segmentLoader }, 'scorecard', configurations);
      expect(result).to.be.a('function');
    });
  });
});