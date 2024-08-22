import {simplify} from '#graph/utils'
import {expect} from 'chai'

const expected = {has_artifact: 'SELF'}

describe('simplify', () => {
    it('and', function () {
        const input = {and: [expected]}
        const result = simplify(input)
        expect(result).to.deep.equal(expected)
    })

    it('and and', function () {
        const input = {and: [{and: [expected]}]}
        const result = simplify(input)
        expect(result).to.deep.equal(expected)
    })

    it('and and and', function () {
        const input = {and: [{and: [{and: [expected]}]}]}
        const result = simplify(input)
        expect(result).to.deep.equal(expected)
    })

    it('or and', function () {
        const input = {or: [{and: [expected]}]}
        const result = simplify(input)
        expect(result).to.deep.equal(expected)
    })
})
