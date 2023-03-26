import {expect} from 'chai'
import {Relation, Node} from '../../src/resolver/graph'

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
