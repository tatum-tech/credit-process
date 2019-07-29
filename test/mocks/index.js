const SAMPLE_ENGINE = {
  "_id": "5b23daea31a45c0eb8c6ab8e",
  "version": 2,
  "module_run_order": [
    {
      "type": "requirements",
      "module_name": 'requirements_module',
      "segments": [ {
        _doc: {}, conditions: [], name: 'test_segment1', ruleset: [ {
          "rule_name": "rule_0",
          "condition_test": "GT",
          "value_comparison": 18,
          "value_comparison_type": "value",
          "variable_name": "age",
          "condition_output": {
            "decline_reason": "Failed Minimum Age Requirement"
          }
        }],
      }, ],
      "active": true,
      "display_name": "Initial Requirements",
      "lookup_name": "init_requirements",
    }
  ],
  "input_variables": [],
  "output_variables": [],
  "calculated_variables": [],
  "decline_reasons": [],
  "rules": [],
  "entitytype": "strategy",
  "status": "active",
  "name": "college_application",
  "title": "College application",
  "organization": "5ac3c1acf51c090b00abe43e"
};

const INVALID_ENGINE = {
  "_id": "5b23daea31a45c0eb8c6ab8e",
  "version": 2,
  "module_run_order": [
    {
      "type": "requirements",
      "module_name": 'requirements_module',
      "segments": [],
      "active": true,
      "display_name": "Initial Requirements",
      "lookup_name": "init_requirements",
    }
  ],
  "input_variables": [],
  "output_variables": [],
  "calculated_variables": [],
  "decline_reasons": [],
  "rules": [],
  "entitytype": "strategy",
  "status": "active",
  "name": "college_application",
  "title": "College application",
  "organization": "5ac3c1acf51c090b00abe43e"
};

const NO_MATCHING_SEGMENT = {
  "_id": "5b23daea31a45c0eb8c6ab8e",
  "version": 2,
  "module_run_order": [
    {
      "type": "requirements",
      "module_name": 'requirements_module',
      "segments": [ {
        _doc: {}, conditions: [], name: 'test_segment1', ruleset: [ {
          "rule_name": "rule_0",
          "condition_test": "LT",
          "value_comparison": 18,
          "value_comparison_type": "value",
          "variable_name": "age",
          "condition_output": {
            "decline_reason": "Failed Minimum Age Requirement"
          }
        }],
      }, ],
      "active": true,
      "display_name": "Initial Requirements",
      "lookup_name": "init_requirements",
    }
  ],
  "input_variables": [],
  "output_variables": [],
  "calculated_variables": [],
  "decline_reasons": [],
  "rules": [],
  "entitytype": "strategy",
  "status": "active",
  "name": "college_application",
  "title": "College application",
  "organization": "5ac3c1acf51c090b00abe43e"
};

module.exports = {
  SAMPLE_ENGINE,
  INVALID_ENGINE,
  NO_MATCHING_SEGMENT,
};