import {expect} from 'chai'
import {VariabilityExpression} from '#spec/variability'
import Solver from '../../src/resolver/solver'

function getDefaultSolver() {
    return new Solver({} as any)
}

describe('cache', () => {
    it('cache: caching', () => {
        const resolver = getDefaultSolver()
        const condition: VariabilityExpression = {max_length: ['hallo', 4]}
        resolver.evaluateVariabilityExpression(condition, {})
        expect(condition.cached_result).to.equal(false)
    })

    it('cache: cached', () => {
        const resolver = getDefaultSolver()
        const result = resolver.evaluateVariabilityExpression({max_length: ['hallo', 4], cached_result: 'cached'}, {})
        expect(result).to.equal('cached')
    })
})
