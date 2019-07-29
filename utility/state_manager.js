'use strict';
const Promisie = require('promisie');
const util = require('util');
const capitalize = require('capitalize');
const DISPLAY_TYPE = {
  'requirements': 'Requirements Rules',
  'scorecard': 'Scoring Model',
  'output': 'Rule Based Output',
  'assignments': 'Simple Output',
  'calculations': 'Calculation Scripts',
  'dataintegration': 'Data Integration',
  'email': 'Email',
  'textmessage': 'Text Message',
  'artificialintelligence': 'AI Model',
};

/**
 * 
 * Updates the global state with the result of the last module that ran
 * @param {string} module_name name of the current module
 * @param {string} module_type type of the current module e.g. requirements
 * @return {Function} Returns function that takes the global state to be updated
 */
var updateState = function (module_name, module_type, module_display_name) {
  return function (state) {
    try {
      state.credit_process = state.credit_process || [];
      if (state.error) {
        delete state.assignments;
        delete state.calculations;
        delete state.requirements;
        delete state.output;
        delete state.scorecard;
        delete state.dataintegration;
        delete state.dataintegrations;
        delete state.artificialintelligence;
        return Promise.reject(Object.assign({}, state, { message: `Error in ${module_type} module ${module_name}: ${state.error.message}`, }));
      }
      if (module_type === 'assignments') {
        let segment_names = (state && state.assignments) ? Object.keys(state.assignments) : [];
        if (segment_names.length > 1) {
          return Promise.reject(Object.assign({}, { decline_reasons: state.decline_reasons, credit_process: state.credit_process, error: '', message: `Error in ${capitalize.words(module_name.replace(/_/g, ' '))} decision module: The decision request falls into multiple population segments and could not be processed.`, }, state));
        } else if (segment_names.length === 0) {
          state.credit_process.push({
            type: DISPLAY_TYPE[ module_type ],
            display_name: module_display_name,
            name: module_name,
            segment: '',
          });
        } else {
          let segment_name = segment_names[ 0 ];
          let assignment_variables = (state && state.assignments && state.assignments[ segment_name ] && state.assignments[ segment_name ].assignments) ? state.assignments[ segment_name ].assignments : {};
          state = Object.assign({}, state, assignment_variables);
          state.assignment_variables = state.assignment_variables || {};
          state.assignment_variables = Object.assign({}, state.assignment_variables, assignment_variables);
          state.assignments[ segment_name ].passed = true;
          state.credit_process.push(Object.assign({}, assignment_variables, {
            name: module_name,
            display_name: module_display_name,
            type: DISPLAY_TYPE[ module_type ],
            segment: segment_name,
          }));
        }
        delete state.assignments;
      }
      if (module_type === 'calculations') {
        let segment_names = (state && state.calculations) ? Object.keys(state.calculations) : [];
        if (segment_names.length > 1) {
          return Promise.reject(Object.assign({}, { decline_reasons: state.decline_reasons, credit_process: state.credit_process, error: '', message: `Error in ${capitalize.words(module_name.replace(/_/g, ' '))} decision module: The decision request falls into multiple population segments and could not be processed.`, }, state));
        } else if (segment_names.length === 0) {
          state.credit_process.push({
            type: DISPLAY_TYPE[ module_type ],
            display_name: module_display_name,
            name: module_name,
            segment: '',
          });
        } else {
          let segment_name = segment_names[ 0 ];
          let calculated_variables = (state && state.calculations && state.calculations[ segment_name ] && state.calculations[ segment_name ].calculations) ? state.calculations[ segment_name ].calculations : {};
          state = Object.assign({}, state, calculated_variables);
          state.calculated_variables = state.calculated_variables || {};
          state.calculated_variables = Object.assign({}, state.calculated_variables, calculated_variables);
          state.calculations[ segment_name ].passed = true;
          state.credit_process.push(Object.assign({}, calculated_variables, {
            name: module_name,
            type: DISPLAY_TYPE[ module_type ],
            display_name: module_display_name,
            segment: segment_name,
          }));
        }
        delete state.calculations;
      }
      if (module_type === 'requirements') {
        let segment_names = (state && state.requirements) ? Object.keys(state.requirements) : [];
        if (segment_names.length > 1) {
          return Promise.reject(Object.assign({}, { decline_reasons: state.decline_reasons, credit_process: state.credit_process, error: '', message: `Error in ${capitalize.words(module_name.replace(/_/g, ' '))} decision module: The decision request falls into multiple population segments and could not be processed.`, }, state));
        } else if (segment_names.length === 0) {
          state.credit_process.push({
            type: DISPLAY_TYPE[ module_type ],
            display_name: module_display_name,
            passed: null,
            name: module_name,
            segment: '',
            decline_reasons: [],
            rules: [],
          });
        } else {
          let segment_name = segment_names[ 0 ];
          state.decline_reasons = state.decline_reasons || [];
          state.decline_reasons = (state.decline_reasons) ? state.decline_reasons.concat(state.requirements[ segment_name ].decline_reasons) : state.requirements[ segment_name ].decline_reasons;
          state.decline_reasons = state.decline_reasons.filter((decline_reason, index) => {
            return state.decline_reasons.indexOf(decline_reason) === index;
          });
          state.passed = (state && state.requirements && state.requirements[ segment_name ]) ? state.requirements[ segment_name ].passed : false;
          state.requirements[ segment_name ].rules = state.requirements[ segment_name ].rules.map(rule => ({
            name: rule.name,
            passed: rule.passed,
            decline_reason: rule.passed ? undefined : rule.decline_reasons,
          }));
          if (state.passed === false) {
            state.credit_process.push({
              name: module_name,
              display_name: module_display_name,
              type: DISPLAY_TYPE[ module_type ],
              segment: segment_name,
              passed: state.requirements[ segment_name ].passed,
              decline_reasons: state.requirements[ segment_name ].decline_reasons,
              rules: state.requirements[ segment_name ].rules,
            });
            delete state.requirements;
            return Promise.reject(Object.assign({}, { decline_reasons: state.decline_reasons, }, state));
          } else {
            state.credit_process.push({
              name: module_name,
              display_name: module_display_name,
              type: DISPLAY_TYPE[ module_type ],
              segment: segment_name,
              passed: state.requirements[ segment_name ].passed,
              decline_reasons: state.requirements[ segment_name ].decline_reasons,
              rules: state.requirements[ segment_name ].rules,
            });
            delete state.requirements;
          }
        }
      }
      if (module_type === 'scorecard') {
        let segment_names = (state && state.scorecard) ? Object.keys(state.scorecard) : [];
        if (segment_names.length > 1) {
          return Promise.reject(Object.assign({}, { decline_reasons: state.decline_reasons, credit_process: state.credit_process, error: '', message: `Error in ${capitalize.words(module_name.replace(/_/g, ' '))} decision module: The decision request falls into multiple population segments and could not be processed.`, }, state));
        } else if (segment_names.length === 0) {
          state.credit_process.push({
            type: DISPLAY_TYPE[ module_type ],
            display_name: module_display_name,
            name: module_name,
            segment: '',
            rules: [],
            output_variable: '',
          });
        } else {
          let segment_name = segment_names[ 0 ];
          let output_variable_key = (state && state.scorecard && state.scorecard[ segment_name ] && state.scorecard[ segment_name ].output_variable) ? state.scorecard[ segment_name ].output_variable : 'score';
          state[ output_variable_key ] = state.scorecard[ segment_name ][ output_variable_key ];
          state.scorecard_variables = state.scorecard_variables || {};
          state.scorecard_variables[ output_variable_key ] = state.scorecard[ segment_name ][ output_variable_key ];
          state.credit_process.push(Object.assign({}, { [ output_variable_key ]: state.scorecard[ segment_name ][ output_variable_key ] }, {
            name: module_name,
            display_name: module_display_name,
            type: DISPLAY_TYPE[ module_type ],
            segment: segment_name,
            output_variable: state.scorecard[ segment_name ].output_variable,
            rules: state.scorecard[ segment_name ].rules,
          }));
        }
        delete state.scorecard;
      }
      if (module_type === 'output') {
        let segment_names = (state && state.output) ? Object.keys(state.output) : [];
        if (segment_names.length > 1) {
          return Promise.reject(Object.assign({}, { decline_reasons: state.decline_reasons, credit_process: state.credit_process, error: '', message: `Error in ${capitalize.words(module_name.replace(/_/g, ' '))} decision module: The decision request falls into multiple population segments and could not be processed.`, }));
        } else if (segment_names.length === 0) {
          state.credit_process.push({
            type: DISPLAY_TYPE[ module_type ],
            display_name: module_display_name,
            name: module_name,
            segment: '',
            rules: [],
          });
        } else {
          let segment_name = segment_names[ 0 ];
          let output = (state && state.output && state.output[ segment_name ] && state.output[ segment_name ].output) ? state.output[ segment_name ].output : {};
          state = Object.assign({}, state, state.output[ segment_name ].output);
          state.output_variables = state.output_variables || {};
          state.output_variables = Object.assign({}, state.output_variables, output);
          state.output[ segment_name ].passed = true;
          state.output[ segment_name ].rules = state.output[ segment_name ].rules.map(rule => Object.assign({}, rule.condition_output, {
            name: rule.name,
            passed: rule.passed,
          }));
          state.credit_process.push(Object.assign({}, output, {
            name: module_name,
            display_name: module_display_name,
            type: DISPLAY_TYPE[ module_type ],
            segment: segment_name,
            rules: state.output[ segment_name ].rules,
          }));
        }
        delete state.output;
      }
      if (module_type === 'dataintegration') {
        let segment_names = (state && state.dataintegration) ? Object.keys(state.dataintegration) : [];
        if (segment_names.length > 1) {
          return Promise.reject(Object.assign({}, { decline_reasons: state.decline_reasons, credit_process: state.credit_process, error: '', message: `Error in ${capitalize.words(module_name.replace(/_/g, ' '))} decision module: The decision request falls into multiple population segments and could not be processed.`, }));
        } else if (segment_names.length === 0) {
          state.credit_process.push({
            display_name: module_display_name,
            type: DISPLAY_TYPE[ module_type ],
            name: module_name,
            segment: '',
            status: '',
          });
        } else {
          let segment_name = segment_names[ 0 ];
          let di = (state && state.dataintegration && state.dataintegration[ segment_name ] && state.dataintegration[ segment_name ]) ? state.dataintegration[ segment_name ] : {};
          state = Object.assign({}, state, di.output);
          state.datasources = state.datasources || [];
          state.datasources.push(di);
          state.dataintegration_variables = state.dataintegration_variables || {};
          state.dataintegration_variables = Object.assign({}, state.dataintegration_variables, di.output);
          state.dataintegration[ segment_name ].type = DISPLAY_TYPE[ module_type ];
          state.credit_process.push({
            name: di.name,
            display_name: module_display_name,
            type: DISPLAY_TYPE[ module_type ],
            segment: di.segment,
            status: di.status,
          });
        }
        delete state.dataintegration;
      }
      if (module_type === 'artificialintelligence') {
        let segment_names = (state && state.artificialintelligence) ? Object.keys(state.artificialintelligence) : [];
        if (segment_names.length > 1) {
          return Promise.reject(Object.assign({}, { decline_reasons: state.decline_reasons, credit_process: state.credit_process, error: '', message: `Error in ${capitalize.words(module_name.replace(/_/g, ' '))} decision module: The decision request falls into multiple population segments and could not be processed.`, }));
        } else if (segment_names.length === 0) {
          state.credit_process.push({
            type: DISPLAY_TYPE[ module_type ],
            display_name: module_display_name,
            name: module_name,
            segment: '',
            predicted_classification: '',
            output_variable: '',
          });
        } else {
          let segment_name = segment_names[ 0 ];
          let ai = (state && state.artificialintelligence && state.artificialintelligence[ segment_name ] && state.artificialintelligence[ segment_name ]) ? state.artificialintelligence[ segment_name ] : {};
          state.artificialintelligence_variables = state.artificialintelligence_variables || {};
          state.artificialintelligence_variables = Object.assign({}, state.artificialintelligence_variables, ai.output);
          if(ai.output_variable &&  ai.output !== undefined) state[ ai.output_variable ] = ai.output[ ai.output_variable ];
          state.credit_process.push(Object.assign({}, {
            name: ai.name,
            type: DISPLAY_TYPE[ module_type ],
            display_name: module_display_name,
            segment: ai.segment,
            predicted_classification: ai.classification
            // output_variable: ai.output_variable,
          }, ai.output));
        }
        delete state.artificialintelligence;
      }
      return state;
    } catch (err) {
      throw new Error(err.message);
    }
  };
};
module.exports = {
  updateState,
};