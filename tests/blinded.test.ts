import Enricher from '#enricher'
import Graph from '#graph/graph'
import Solver from '#resolver/solver'
import {ServiceTemplate} from '#spec/service-template'
import {expect} from 'chai'
import * as yaml from 'js-yaml'

// TODO: unblind me

describe('blinded', () => {
    it('one', async () => {
        await blined(
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

        `,
            [
                {
                    'type.source@0.node.source': true,
                    'node.source': true,
                    'type.target@0.node.target': false,
                    'node.target': false,
                    'relation.relation@0.node.source': false,
                    'manual.relation.relation@0.node.source': true,
                },
                {
                    'type.source@0.node.source': true,
                    'node.source': true,
                    'type.target@0.node.target': true,
                    'node.target': true,
                    'relation.relation@0.node.source': true,
                    'manual.relation.relation@0.node.source': true,
                },
            ]
        )
    })

    it('two', async () => {
        await blined(
            `
tosca_definitions_version: tosca_variability_1_0

topology_template:
    variability:
        options:
            node_default_condition: true
            node_default_condition_mode: incoming
            
     
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

        `,
            [
                {
                    'type.source@0.node.source': true,
                    'node.source': true,
                    'type.target@0.node.target': true,
                    'node.target': true,
                    'relation.relation@0.node.source': true,
                    'manual.relation.relation@0.node.source': true,
                },
            ]
        )
    })
})

async function blined(template: string, expected: Record<string, boolean>[]) {
    const _template = yaml.load(template) as ServiceTemplate
    await Enricher.enrich({template: _template})

    const solver = new Solver(new Graph(_template))
    const result = solver.solveAll()

    expect(result).to.deep.equal(expected)
}
