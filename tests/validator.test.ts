import {ensureStringOrNumber} from '#validator'
import {expect} from 'chai'
import {ensureName} from '../src/utils/validator'

// TODO: add more tests

describe('validator', () => {
    it('isStringOrNumber: is string', () => {
        expect(() => ensureStringOrNumber('string')).not.to.throw()
    })

    it('isStringOrNumber: is number', () => {
        expect(() => ensureStringOrNumber(1)).not.to.throw()
    })

    it('ensureName: is name', () => {
        expect(() => ensureName('this-is-a-valid-name')).not.to.throw()
    })

    it('ensureName: throw space', () => {
        const name = ' '
        expect(() => ensureName(name)).to.throw(
            `Name "${name}" not allowed. Only small characters and hyphens are allowed.`
        )
    })

    it('ensureName: throw number', () => {
        const name = '123'
        expect(() => ensureName(name)).to.throw(
            `Name "${name}" not allowed. Only small characters and hyphens are allowed.`
        )
    })
})
