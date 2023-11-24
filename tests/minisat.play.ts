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
            node_default_condition_mode: incoming-host
            hosting_stack_constraint: false
            optimization: true

    node_templates:
        agent:
            type: agent
            requirements:
                - host: vm

        worker:
            type: worker
            consumed: true
            requirements:
                - host:
                      node: vm

        vm:
            type: vm
            requirements:
                - host: hypervisor

        hypervisor:
            type: hypervisor
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
