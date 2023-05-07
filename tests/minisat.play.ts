import * as yaml from 'js-yaml'
import Graph from '../src/graph/graph'
import Solver from '../src/resolver/solver'
import {ServiceTemplate} from '../src/specification/service-template'

describe('minisat', () => {
    it('play', () => {
        play(
            `
tosca_definitions_version: tosca_variability_1_0

topology_template:
    variability:
        options:
            node_default_condition: true
            relation_default_condition: true

    node_templates:
        node_one:
            type: node_one

        node_two:
            type: node_two
            conditions: {not: {node_presence: node_one}}
            requirements:
                - relation_one: node_one

        `
        )
    })
})

function play(template: string) {
    const solver = new Solver(new Graph(yaml.load(template) as ServiceTemplate))
    console.log(solver.solveAll())
}
