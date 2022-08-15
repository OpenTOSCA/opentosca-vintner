import {expect} from 'chai'
import benchmark, {generateBenchmarkServiceTemplate} from '../src/controller/setup/benchmark'
import * as yaml from 'js-yaml'
import {prettyJSON} from '../src/utils/utils'

it('benchmark', () => {
    benchmark({seeds: [2], runs: 1})
})

it('generateBenchmarkServiceTemplate', () => {
    const result = generateBenchmarkServiceTemplate(2)
    expect(prettyJSON(result)).to.equal(
        prettyJSON(
            yaml.load(
                `
tosca_definitions_version: tosca_variability_1_0
topology_template:
    variability:
        inputs:
            mode: {type: string}
        expressions:
            condition_0_present: {equal: [{get_variability_input: mode}, present]}
            condition_0_removed: {equal: [{get_variability_input: mode}, absent]}
            condition_1_present: {equal: [{get_variability_input: mode}, present]}
            condition_1_removed: {equal: [{get_variability_input: mode}, absent]}
            
    node_templates:
        component_0_present:
            type: component_type_0_present
            conditions: {get_variability_condition: condition_0_present}
            requirements:
                - relation_present:
                    node: component_1_present
                    conditions: {get_variability_condition: condition_0_present}
                    relationship: relationship_0_present
                - relation_removed:
                    node: component_1_removed
                    conditions: {get_variability_condition: condition_0_removed}
                    relationship: relationship_0_removed
        component_0_removed:
            type: component_type_0_removed
            conditions: {get_variability_condition: condition_0_removed}
        component_1_present:
            type: component_type_1_present
            conditions: {get_variability_condition: condition_1_present}
            requirements:
                - relation_present:
                    node: component_0_present
                    conditions: {get_variability_condition: condition_1_present}
                    relationship: relationship_1_present
                - relation_removed:
                    node: component_0_removed
                    conditions: {get_variability_condition: condition_1_removed}
                    relationship: relationship_1_removed
        component_1_removed:
            type: component_type_1_removed
            conditions: {get_variability_condition: condition_1_removed}
 
    relationship_templates:
        relationship_0_present:
            type: relationship_type_0_present
        relationship_0_removed:
            type: relationship_type_0_removed
        relationship_1_present:
            type: relationship_type_1_present
        relationship_1_removed:
            type: relationship_type_1_removed
`
            )
        )
    )
})
