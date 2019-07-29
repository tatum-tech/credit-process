'use strict';
const chai = require('chai');
const expect = chai.expect;
const Promisie = require('promisie');
const updateState = require('../../../utility/state_manager').updateState;
const path = require('path');

chai.use(require('chai-spies'));

describe('State Manager updateState method', function () {
  describe('handling of error on state', function () {
    let statemanager;
    before(done => {
      statemanager = updateState('test_error_module', 'requirements');
      done();
    });
    it('should reject when there is an error on state', async function () {
      try {
        let result = await statemanager({
          error: new Error('Test Error on State'),
          credit_process: [],
        });
      } catch (e) {
        expect(e.error).to.be.instanceOf(Error);
        expect(e.message).to.equal('Error in requirements module test_error_module: Test Error on State')
      }
    });
  });

  describe('evaluation of assignments module', function () {
    let statemanager;
    before(done => {
      statemanager = updateState('assignments_module', 'assignments');
      done();
    });
    it('should reject when there are more than one matching segments', async function () {
      try {
        let result = await statemanager({
          assignments: {
            segment_one: {},
            segment_two: {},
          },
          credit_process: [],
        });
      } catch (e) {
        expect(e.message).to.equal('Error in Assignments Module decision module: The decision request falls into multiple population segments and could not be processed.')
      }
    });
    it('should add empty module object to credit process array', async function () {
      let result = await statemanager({
        assignments: {},
        credit_process: [],
      });
      expect(result).to.have.property('credit_process');
      expect(result.credit_process).to.be.an('array');
      expect(result.credit_process[ 0 ].type).to.equal('Simple Output');
      expect(result.credit_process[ 0 ].name).to.equal('assignments_module');
      expect(result.credit_process[ 0 ].segment).to.be.empty;
    });
    it('should output the results of the matching segment', async function () {
      let result = await statemanager({
        assignments: {
          segment_one: {
            passed: true,
            assignments: {
              greetings: 'hi',
            },
          },
        },
        credit_process: [],
      });
      expect(result).to.have.property('credit_process');
      expect(result.credit_process).to.be.an('array');
      expect(result).to.have.property('greetings');
      expect(result).to.have.property('assignment_variables');
      expect(result.greetings).to.equal('hi');
      expect(result.credit_process[ 0 ].type).to.equal('Simple Output');
      expect(result.credit_process[ 0 ].name).to.equal('assignments_module');
      expect(result.credit_process[ 0 ].greetings).to.equal('hi');
    });
  });

  describe('evaluation of calculations module', function () {
    let statemanager;
    before(done => {
      statemanager = updateState('calculations_module', 'calculations');
      done();
    });
    it('should reject when there are more than one matching segments', async function () {
      try {
        let result = await statemanager({
          calculations: {
            segment_one: {},
            segment_two: {},
          },
          credit_process: [],
        });
      } catch (e) {
        expect(e.message).to.equal('Error in Calculations Module decision module: The decision request falls into multiple population segments and could not be processed.')
      }
    });
    it('should add empty module object to credit process array', async function () {
      let result = await statemanager({
        calculations: {},
        credit_process: [],
      });
      expect(result).to.have.property('credit_process');
      expect(result.credit_process).to.be.an('array');
      expect(result.credit_process[ 0 ].type).to.equal('Calculation Scripts');
      expect(result.credit_process[ 0 ].name).to.equal('calculations_module');
      expect(result.credit_process[ 0 ].segment).to.be.empty;
    });
    it('should output the results of the matching segment', async function () {
      let result = await statemanager({
        calculations: {
          segment_one: {
            passed: true,
            calculations: {
              greetings: 'return "hi"',
            },
          },
        },
        credit_process: [],
      });
      expect(result).to.have.property('credit_process');
      expect(result.credit_process).to.be.an('array');
      expect(result).to.have.property('greetings');
      expect(result).to.have.property('calculated_variables');
      expect(result.credit_process[ 0 ].type).to.equal('Calculation Scripts');
      expect(result.greetings).to.equal('return "hi"');
      expect(result.credit_process[ 0 ].name).to.equal('calculations_module');
      expect(result.credit_process[ 0 ].greetings).to.equal('return "hi"');
    });
  });

  describe('evaluation of requirements module', function () {
    let statemanager;
    before(done => {
      statemanager = updateState('requirements_module', 'requirements');
      done();
    });
    it('should reject when there are more than one matching segments', async function () {
      try {
        let result = await statemanager({
          requirements: {
            segment_one: {},
            segment_two: {},
          },
          credit_process: [],
        });
      } catch (e) {
        expect(e.message).to.equal('Error in Requirements Module decision module: The decision request falls into multiple population segments and could not be processed.')
      }
    });
    it('should add empty module object to credit process array', async function () {
      let result = await statemanager({
        requirements: {},
        credit_process: [],
      });
      expect(result).to.have.property('credit_process');
      expect(result.credit_process).to.be.an('array');
      expect(result.credit_process[ 0 ].type).to.equal('Requirements Rules');
      expect(result.credit_process[ 0 ].name).to.equal('requirements_module');
      expect(result.credit_process[ 0 ].segment).to.be.empty;
    });
    it('should output the results of matching segment if the segment has passed', async function () {
      let result = await statemanager({
        requirements: {
          segment_one: {
            passed: true,
            rules: [ {
              name: 'rule_0',
              passed: true,
              decline_reason: undefined,
            }],
            decline_reasons: [],
            passed: true,
          },
        },
        credit_process: [],
      });
      expect(result).to.have.property('credit_process');
      expect(result.credit_process).to.be.an('array');
      expect(result).to.have.property('decline_reasons');
      expect(result).to.have.property('passed');
      expect(result.credit_process[ 0 ].type).to.equal('Requirements Rules');
      expect(result.credit_process[ 0 ].passed).to.equal(true);
      expect(result.credit_process[ 0 ].decline_reasons).to.empty;
    });

    it('should reject if evaluted segment did not pass', async function () {
      try {
        let result = await statemanager({
          requirements: {
            segment_one: {
              passed: false,
              rules: [ {
                name: 'rule_0',
                passed: false,
                decline_reason: [ 'Failed Minimum Age Requirements' ],
              }],
              decline_reasons: [ 'Failed Minimum Age Requirements' ],
              passed: false,
            },
          },
          credit_process: [],
        });
      } catch (e) {
        expect(e).to.have.property('credit_process');
        expect(e.credit_process).to.be.an('array');
        expect(e).to.have.property('decline_reasons');
        expect(e).to.have.property('passed');
        expect(e.credit_process[ 0 ].type).to.equal('Requirements Rules');
        expect(e.credit_process[ 0 ].passed).to.equal(false);
        expect(e.credit_process[ 0 ].decline_reasons.length).to.equal(1);
        expect(e.credit_process[ 0 ].decline_reasons[ 0 ]).to.equal('Failed Minimum Age Requirements');
      }
    });
  });

  describe('evaluation of scorecard module', function () {
    let statemanager;
    before(done => {
      statemanager = updateState('scorecard_module', 'scorecard');
      done();
    });
    it('should reject when there are more than one matching segments', async function () {
      try {
        let result = await statemanager({
          scorecard: {
            segment_one: {},
            segment_two: {},
          },
          credit_process: [],
        });
      } catch (e) {
        expect(e.message).to.equal('Error in Scorecard Module decision module: The decision request falls into multiple population segments and could not be processed.')
      }
    });
    it('should add empty module object to credit process array', async function () {
      let result = await statemanager({
        scorecard: {},
        credit_process: [],
      });
      expect(result).to.have.property('credit_process');
      expect(result.credit_process).to.be.an('array');
      expect(result.credit_process[ 0 ].type).to.equal('Scoring Model');
      expect(result.credit_process[ 0 ].name).to.equal('scorecard_module');
      expect(result.credit_process[ 0 ].segment).to.be.empty;
    });
    it('should output the results of matching segment if the segment has passed', async function () {
      let result = await statemanager({
        scorecard: {
          segment_one: {
            output_variable: 'total_weight',
            total_weight: 100,
            rules: [ {
              name: 'rule_0',
            }],
          },
        },
        credit_process: [],
      });
      expect(result).to.have.property('credit_process');
      expect(result.credit_process).to.be.an('array');
      expect(result).to.have.property('total_weight');
      expect(result).to.have.property('scorecard_variables');
      expect(result.credit_process[ 0 ].type).to.equal('Scoring Model');
      expect(result.credit_process[ 0 ].output_variable).to.equal('total_weight');
      expect(result.credit_process[ 0 ].total_weight).to.equal(100);
    });
  });

  describe('evaluation of output module', function () {
    let statemanager;
    before(done => {
      statemanager = updateState('output_module', 'output');
      done();
    });
    it('should reject when there are more than one matching segments', async function () {
      try {
        let result = await statemanager({
          output: {
            segment_one: {},
            segment_two: {},
          },
          credit_process: [],
        });
      } catch (e) {
        expect(e.message).to.equal('Error in Output Module decision module: The decision request falls into multiple population segments and could not be processed.')
      }
    });
    it('should add empty module object to credit process array', async function () {
      let result = await statemanager({
        output: {},
        credit_process: [],
      });
      expect(result).to.have.property('credit_process');
      expect(result.credit_process).to.be.an('array');
      expect(result.credit_process[ 0 ].type).to.equal('Rule Based Output');
      expect(result.credit_process[ 0 ].name).to.equal('output_module');
      expect(result.credit_process[ 0 ].segment).to.be.empty;
    });
    it('should output the results of matching segment if the segment has passed', async function () {
      let result = await statemanager({
        output: {
          segment_one: {
            output: {
              pet_type: 'dog',
            },
            rules: [ {
              name: 'rule_0',
            }],
          },
        },
        credit_process: [],
      });
      expect(result).to.have.property('credit_process');
      expect(result.credit_process).to.be.an('array');
      expect(result).to.have.property('pet_type');
      expect(result).to.have.property('output_variables');
      expect(result[ 'output_variables' ]).to.have.property('pet_type');
      expect(result.credit_process[ 0 ].type).to.equal('Rule Based Output');
      expect(result.output_variables.pet_type).to.equal('dog');
      expect(result.pet_type).to.equal('dog');
    });
  });

  describe('evaluation of data integration module', function () {
    let statemanager;
    before(done => {
      statemanager = updateState('dataintegration_module', 'dataintegration');
      done();
    });
    it('should reject when there are more than one matching segments', async function () {
      try {
        let result = await statemanager({
          dataintegration: {
            segment_one: {},
            segment_two: {},
          },
          credit_process: [],
        });
      } catch (e) {
        expect(e.message).to.equal('Error in Dataintegration Module decision module: The decision request falls into multiple population segments and could not be processed.')
      }
    });
    it('should add empty module object to credit process array', async function () {
      let result = await statemanager({
        dataintegration: {},
        credit_process: [],
      });
      expect(result).to.have.property('credit_process');
      expect(result.credit_process).to.be.an('array');
      expect(result.credit_process[ 0 ].type).to.equal('Data Integration');
      expect(result.credit_process[ 0 ].name).to.equal('dataintegration_module');
      expect(result.credit_process[ 0 ].segment).to.be.empty;
    });
    it('should output the results of matching segment if the segment has passed', async function () {
      let result = await statemanager({
        dataintegration: {
          segment_one: {
            name: 'segment_one',
            segment: {},
            output: {
              current_zillow_estimate: 600000,
            },
            status: 200,
          },
        },
        dataintegration_variables: {
          prev_zillow_estimate: 400000, 
        },
        credit_process: [],
      });
      expect(result).to.have.property('credit_process');
      expect(result.credit_process).to.be.an('array');
      expect(result.datasources).to.be.an('array');
      expect(result).to.have.property('datasources');
      expect(result.dataintegration_variables).to.have.property('current_zillow_estimate');
      expect(result.dataintegration_variables).to.have.property('prev_zillow_estimate');
      expect(result.dataintegration_variables['current_zillow_estimate']).to.equal(600000);
      expect(result.dataintegration_variables['prev_zillow_estimate']).to.equal(400000);
      expect(result.credit_process[ 0 ].type).to.equal('Data Integration');
      expect(result.credit_process[ 0 ].name).to.equal('segment_one');
      expect(result.datasources[ 0 ].name).to.equal('segment_one');
      expect(result.datasources[ 0 ].output.current_zillow_estimate).to.equal(600000);
    });
  });

  describe('evaluation of ML module', function () {
    let statemanager;
    before(done => {
      statemanager = updateState('ml_module', 'artificialintelligence');
      done();
    });
    it('should reject when there are more than one matching segments', async function () {
      try {
        let result = await statemanager({
          artificialintelligence: {
            segment_one: {},
            segment_two: {},
          },
          credit_process: [],
        });
      } catch (e) {
        expect(e.message).to.equal('Error in Ml Module decision module: The decision request falls into multiple population segments and could not be processed.')
      }
    });
    it('should add empty module object to credit process array', async function () {
      let result = await statemanager({
        artificialintelligence: {},
        credit_process: [],
      });
      expect(result).to.have.property('credit_process');
      expect(result.credit_process).to.be.an('array');
      expect(result.credit_process[ 0 ].type).to.equal('AI Model');
      expect(result.credit_process[ 0 ].name).to.equal('ml_module');
      expect(result.credit_process[ 0 ].segment).to.be.empty;
    });
    it('should output the results of matching segment if the segment has passed', async function () {
      let result = await statemanager({
        artificialintelligence: {
          segment_one: {
            name: 'segment_one',
            classification: 'BINARY',
            output_variable: 'binary_score',
            segment: {},
            output: {
              binary_score: 0.7,
            },
            status: 200,
          },
        },
        artificialintelligence_variables: {
          prev_zillow_estimate: 400000, 
        },
        credit_process: [],
      });
      expect(result).to.have.property('credit_process');
      expect(result.credit_process).to.be.an('array');
      expect(result).to.have.property('artificialintelligence_variables');
      expect(result).to.have.property('binary_score');
      expect(result['binary_score']).to.equal(0.7);
      expect(result.artificialintelligence_variables[ 'binary_score' ]).to.equal(0.7);
      expect(result.credit_process[ 0 ].type).to.equal('AI Model');
      expect(result.credit_process[ 0 ].predicted_classification).to.equal('BINARY');
    });
  });

});