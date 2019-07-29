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
const compileAssignmentsSegmentEvaluations = require('../../../utility/assignments');

describe('Utility/Assignments', function () {
  describe('compileAssignmentsSegmentEvaluations', () => {
    it('should return the evalators with the assignments segment', async function () {
      let segments = [ { _doc: {}, name: 'test_segment1', ruleset: [], }, { _doc: {}, name: 'test_segment2', ruleset: [], }];
      let result = await compileAssignmentsSegmentEvaluations.call({}, segments, {});
      expect(result).to.be.an('array');
      expect(result[ 0 ].evaluator).to.be.a('function');
    });
    it('should handle errors', async function () {
      try {
        let segments = [ { _doc: {}, name: 'test_segment1' }, { _doc: {}, name: 'test_segment2' }];
        let result = await compileAssignmentsSegmentEvaluations.call({}, segments, {});
      } catch (e) {
        expect(e).to.be.instanceof(Error);
      }
    })
  });
});