import Enricher from '#enricher'
import Graph from '#graph/graph'
import Solver from '#resolver/solver'
import {ServiceTemplate} from '#spec/service-template'
import std from '#std'
import * as yaml from 'js-yaml'

describe('minisat', () => {
    it('play', async () => {
        await play(
            `
tosca_definitions_version: tosca_variability_1_0

topology_template:
    variability:
        options:
            node_default_condition: true
            node_default_condition_mode: incomingnaive
            
     
            relation_default_condition: true
            relation_default_condition_mode: source-target

            type_default_condition: true
    node_templates:
        source:
            type: source
            requirements:
                - relation:
                      node: target

        target:
            type: target

        `
        )
    })
})

async function play(data: string) {
    const template = yaml.load(data) as ServiceTemplate
    await Enricher.enrich({template})

    const solver = new Solver(new Graph(template))
    std.log(solver.solveAll())
}
