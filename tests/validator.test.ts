import * as assert from '#assert'
import {expect} from 'chai'

// TODO: add more tests

describe('validator', () => {
    it('isStringOrNumber: is string', () => {
        expect(() => assert.isStringOrNumber('string')).not.to.throw()
    })

    it('isStringOrNumber: is number', () => {
        expect(() => assert.isStringOrNumber(1)).not.to.throw()
    })

    it('ensureName: is name', () => {
        expect(() => assert.isName('this-is-a-valid-name-v0.0.2')).not.to.throw()
    })

    it('ensureName: throw space', () => {
        const name = ' '
        expect(() => assert.isName(name)).to.throw(
            `Name "${name}" not allowed. Only small characters, numbers, hyphens, and dots are allowed.`
        )
    })
})
