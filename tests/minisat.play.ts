import Graph from '#graph/graph'
import Solver from '#resolver/solver'
import {ServiceTemplate} from '#spec/service-template'
import * as yaml from 'js-yaml'

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
