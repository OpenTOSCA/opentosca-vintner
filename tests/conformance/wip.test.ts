import {expect} from 'chai'
import {VariabilityExpression} from '#spec/variability'
import Solver from '../../src/resolver/solver'
import Graph from '../../src/resolver/graph'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '../../src/specification/service-template'
import * as yaml from 'js-yaml'

// TODO: delete this test file

function run(template: string) {
    const solver = new Solver(new Graph(yaml.load(template) as ServiceTemplate))
    const result = solver.run()
    console.log(result)
}

describe('solver', () => {
    it('solver', () => {
        run(`
tosca_definitions_version: tosca_variability_1_0

topology_template: 
    node_templates: 
        node_one: 
            conditions: {and: [{and: [true, true]}, true, true, {get_node_presence: node_two} ]}
            
        node_two: 
            conditions: true
        `)
    })
})
