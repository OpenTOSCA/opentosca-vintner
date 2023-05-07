import {expect} from 'chai'
import * as yaml from 'js-yaml'
import Graph from '../src/graph/graph'
import Solver from '../src/resolver/solver'
import {ServiceTemplate} from '../src/specification/service-template'

describe('minisat', () => {
    it('alpha', () => {
        run(
            `
tosca_definitions_version: tosca_variability_1_0
topology_template: 
    node_templates: 
        node_one:
            type: type_one
            conditions: {node_presence: node_two}
            
        node_two: 
            type: type_two
            conditions: true
        `,
            [
                'not(false)',
                'true',
                'type.type_one@0.node.node_one',
                'type.type_two@0.node.node_two',
                'node.node_one or not(node.node_two)',
                'not(node.node_one) or node.node_two',
                'node.node_two',
            ].join(`\n`)
        )
    })
})

function run(template: string, expected: string) {
    const solver = new Solver(new Graph(yaml.load(template) as ServiceTemplate))
    solver.transform()
    expect(solver.toCNF()).to.equal(expected)
}
