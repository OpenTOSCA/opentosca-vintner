import * as check from '#check'
import Controller from '#controller'
import {Asset} from '#repositories/assets'
import {Instance} from '#repositories/instances'
import {Template} from '#repositories/templates'
import {expect} from 'chai'

const invalid = ['.', '..', '../..', '../x', '.hidden', '-rf', 'a/b', 'a\\b', '', 'UPPER', 'a b']

async function error(fn: () => unknown) {
    try {
        await fn()
    } catch (e) {
        return e as Error
    }
}

describe('repositories', () => {
    it('valid names', () => {
        for (const name of ['shop', 'shop-1', 'shop.v2', '1', 'a..b']) expect(check.isName(name), name).to.be.true
    })

    it('invalid names', () => {
        for (const name of invalid) expect(check.isName(name), name).to.be.false
    })

    it('repositories reject invalid names', () => {
        for (const name of invalid) {
            expect(() => new Template(name), name).to.throw(`Name "${name}" not allowed`)
            expect(() => new Instance(name), name).to.throw(`Name "${name}" not allowed`)
            expect(() => new Asset(name), name).to.throw(`Name "${name}" not allowed`)
        }
    })

    it('controllers reject path traversal', async () => {
        expect((await error(() => Controller.templates.delete({template: '../..'})))?.message).to.contain(
            'Name "../.." not allowed'
        )
        expect(
            (await error(() => Controller.instances.delete({instance: '../../..', force: true})))?.message
        ).to.contain('Name "../../.." not allowed')
        expect((await error(() => Controller.assets.content({name: '../../.ssh/id_rsa'})))?.message).to.contain(
            'Name "../../.ssh/id_rsa" not allowed'
        )
    })
})
