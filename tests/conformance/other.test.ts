import {expect} from 'chai'
import {VariabilityExpression} from '#spec/variability'
import Solver from '../../src/resolver/solver'
import Graph, {Relation, Node} from '../../src/resolver/graph'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '../../src/specification/service-template'

function getDefaultSolver(template?: ServiceTemplate) {
    return new Solver(
        new Graph(template || {tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0})
    )
}

describe('cache', () => {
    it('cache: caching', () => {
        const solver = getDefaultSolver()
        const condition: VariabilityExpression = {max_length: ['hallo', 4]}
        solver.evaluateValueExpression(condition, {})
        expect(condition._cached_result).to.equal(false)
    })

    it('cache: cached', () => {
        const solver = getDefaultSolver()
        const result = solver.evaluateValueExpression({max_length: ['hallo', 4], _cached_result: 'cached'}, {})
        expect(result).to.equal('cached')
    })
})

describe('host', () => {
    it('connects_to', () => {
        const node = new Node({name: 'node', raw: {}} as any)
        const relation = new Relation({name: 'connects_to', container: node, raw: {}} as any)
        expect(relation.isHostedOn()).to.equal(false)
    })

    it('not-host', () => {
        const node = new Node({name: 'node', raw: {}} as any)
        const relation = new Relation({name: 'not-host', container: node, raw: {}} as any)
        expect(relation.isHostedOn()).to.equal(false)
    })

    it('host', () => {
        const node = new Node({name: 'node', raw: {}} as any)
        const relation = new Relation({name: 'host', container: node, raw: {}} as any)
        expect(relation.isHostedOn()).to.equal(true)
    })

    it('_host', () => {
        const node = new Node({name: 'node', raw: {}} as any)
        const relation = new Relation({name: '_host', container: node, raw: {}} as any)
        expect(relation.isHostedOn()).to.equal(true)
    })

    it('dev_host', () => {
        const node = new Node({name: 'node', raw: {}} as any)
        const relation = new Relation({name: 'dev_host', container: node, raw: {}} as any)
        expect(relation.isHostedOn()).to.equal(true)
    })

    it('host_', () => {
        const node = new Node({name: 'node', raw: {}} as any)
        const relation = new Relation({name: 'host_', container: node, raw: {}} as any)
        expect(relation.isHostedOn()).to.equal(true)
    })

    it('host_dev', () => {
        const node = new Node({name: 'node', raw: {}} as any)
        const relation = new Relation({name: 'host_dev', container: node, raw: {}} as any)
        expect(relation.isHostedOn()).to.equal(true)
    })

    it('dev_host_dev', () => {
        const node = new Node({name: 'node', raw: {}} as any)
        const relation = new Relation({name: 'dev_host_dev', container: node, raw: {}} as any)
        expect(relation.isHostedOn()).to.equal(true)
    })
})
