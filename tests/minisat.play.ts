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
            mode: loose

    node_templates:
        one:
            type: one
            conditions: {not: {node_presence: two}}
            requirements:
                - host: one_host

        one_host:
            type: one_host

        two:
            type: two
            conditions: {not: {node_presence: one}}
            requirements:
                - host: two_host

        two_host:
            type: two_host

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
