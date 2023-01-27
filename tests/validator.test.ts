import {ensureStringOrNumber} from '#validator'
import {expect} from 'chai'

// TODO: add more tests

describe('validator', () => {
    it('isStringOrNumber: is string', () => {
        expect(() => ensureStringOrNumber('string')).not.to.throw()
    })

    it('isStringOrNumber: is number', () => {
        expect(() => ensureStringOrNumber(1)).not.to.throw()
    })
})
