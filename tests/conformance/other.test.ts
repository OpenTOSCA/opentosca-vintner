import {expect} from 'chai'
import {VariabilityExpression} from '#spec/variability'
import {VariabilityResolver} from '#/resolver'

function getDefaultVariabilityResolver() {
    return new VariabilityResolver({} as any)
}

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
