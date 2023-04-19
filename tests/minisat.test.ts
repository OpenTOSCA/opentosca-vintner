import Solver from '../src/resolver/solver'
import Graph from '../src/resolver/graph'
import {ServiceTemplate} from '../src/specification/service-template'
import * as yaml from 'js-yaml'
import {expect} from 'chai'

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
            '(not(false)) and (true) and (type.type_one@0.node.node_one) and (type.type_two@0.node.node_two) and (node.node_one or not(node.node_two)) and (not(node.node_one) or node.node_two) and (node.node_two)'
        )
    })
})

function run(template: string, expected: string) {
    const solver = new Solver(new Graph(yaml.load(template) as ServiceTemplate))
    solver.transform()
    expect(solver.toCNF()).to.equal(expected)
}
