import {ensureName, ensureStringOrNumber} from '#validator'
import {expect} from 'chai'

// TODO: add more tests

describe('validator', () => {
    it('isStringOrNumber: is string', () => {
        expect(() => ensureStringOrNumber('string')).not.to.throw()
    })

    it('isStringOrNumber: is number', () => {
        expect(() => ensureStringOrNumber(1)).not.to.throw()
    })

    it('ensureName: is name', () => {
        expect(() => ensureName('this-is-a-valid-name-v0.0.2')).not.to.throw()
    })

    it('ensureName: throw space', () => {
        const name = ' '
        expect(() => ensureName(name)).to.throw(
            `Name "${name}" not allowed. Only small characters, numbers, hyphens, and dots are allowed.`
        )
    })
})
