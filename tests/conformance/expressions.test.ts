import {expect} from 'chai'
import {VariabilityResolver} from '#controller/template/resolve'
import {VariabilityExpression} from '#spec/variability'

function getDefaultVariabilityResolver() {
    return new VariabilityResolver({} as any)
}

describe('arithmetic', () => {
    it('add: correct -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({add: [10, 1, 1, 1, 1, 1]}, {})
        expect(result).to.equal(15)
    })

    it('sub: correct -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({sub: [10, 1, 1, 1, 1, 1]}, {})
        expect(result).to.equal(5)
    })

    it('mul: correct -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({mul: [10, 1, 3, 4]}, {})
        expect(result).to.equal(120)
    })

    it('div: correct -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({div: [10, 1, 2, 5]}, {})
        expect(result).to.equal(1)
    })

    it('mod: 0 -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({mod: [10, 2]}, {})
        expect(result).to.equal(0)
    })

    it('mod: 1 -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({mod: [11, 2]}, {})
        expect(result).to.equal(1)
    })
})

describe('intrinsic', () => {
    it('concat', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({concat: ['hello', ' ', 'world']}, {})
        expect(result).to.equal('hello world')
    })

    it('join', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({join: [['hello', 'world'], ' ']}, {})
        expect(result).to.equal('hello world')
    })

    it('token', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({token: ['hello world', ' ', 1]}, {})
        expect(result).to.equal('world')
    })
})
describe('constraint', () => {
    it('equal true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({equal: [1, 1, 1]}, {})
        expect(result).to.equal(true)
    })

    it('equal false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({equal: [1, 1, 2]}, {})
        expect(result).to.equal(false)
    })

    it('greater_than: greater -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({greater_than: [2, 1]}, {})
        expect(result).to.equal(true)
    })

    it('greater_than: equal -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({greater_than: [1, 1]}, {})
        expect(result).to.equal(false)
    })

    it('greater_than: less -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({greater_than: [0, 1]}, {})
        expect(result).to.equal(false)
    })

    it('greater_or_equal: greater -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({greater_or_equal: [2, 1]}, {})
        expect(result).to.equal(true)
    })

    it('greater_or_equal: equal -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({greater_or_equal: [1, 1]}, {})
        expect(result).to.equal(true)
    })

    it('greater_or_equal: less -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({greater_or_equal: [0, 1]}, {})
        expect(result).to.equal(false)
    })

    it('less_than: greater -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({less_than: [2, 1]}, {})
        expect(result).to.equal(false)
    })

    it('less_than: equal -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({less_than: [1, 1]}, {})
        expect(result).to.equal(false)
    })

    it('less_than: less -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({less_than: [0, 1]}, {})
        expect(result).to.equal(true)
    })

    it('less_or_equal: greater -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({less_or_equal: [2, 1]}, {})
        expect(result).to.equal(false)
    })

    it('less_or_equal: equal -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({less_or_equal: [1, 1]}, {})
        expect(result).to.equal(true)
    })

    it('less_or_equal: less -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({less_or_equal: [0, 1]}, {})
        expect(result).to.equal(true)
    })

    it('in_range: true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({in_range: [1, [0, 1]]}, {})
        expect(result).to.equal(true)
    })

    it('in_range: false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({in_range: [2, [0, 1]]}, {})
        expect(result).to.equal(false)
    })

    it('valid_values: true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({valid_values: [1, [0, 1]]}, {})
        expect(result).to.equal(true)
    })

    it('valid_values: false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({valid_values: [2, [0, 1]]}, {})
        expect(result).to.equal(false)
    })

    it('length: too long -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({length: ['hallo', 4]}, {})
        expect(result).to.equal(false)
    })

    it('length: true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({length: ['hallo', 5]}, {})
        expect(result).to.equal(true)
    })

    it('min_length: less -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({min_length: ['hallo', 6]}, {})
        expect(result).to.equal(false)
    })

    it('min_length: exact -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({min_length: ['hallo', 5]}, {})
        expect(result).to.equal(true)
    })

    it('min_length: more -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({min_length: ['hallo', 4]}, {})
        expect(result).to.equal(true)
    })

    it('max_length: less -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({max_length: ['hallo', 6]}, {})
        expect(result).to.equal(true)
    })

    it('max_length: exact -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({max_length: ['hallo', 5]}, {})
        expect(result).to.equal(true)
    })

    it('max_length: more -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({max_length: ['hallo', 4]}, {})
        expect(result).to.equal(false)
    })
})

describe('cache', () => {
    it('cache: caching', () => {
        const resolver = getDefaultVariabilityResolver()
        const condition: VariabilityExpression = {max_length: ['hallo', 4]}
        resolver.evaluateVariabilityExpression(condition, {})
        expect(condition.cached_result).to.equal(false)
    })

    it('cache: cached', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({max_length: ['hallo', 4], cached_result: 'cached'}, {})
        expect(result).to.equal('cached')
    })
})
