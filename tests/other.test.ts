import {expect} from 'chai'
import Graph from '../src/graph/graph'
import Solver from '../src/resolver/solver'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '../src/specification/service-template'
import {VariabilityExpression} from '../src/specification/variability'

function getDefaultSolver(template?: ServiceTemplate) {
    return new Solver(
        new Graph(template || {tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0})
    )
}

describe('cache', () => {
    it('cache: caching', () => {
        const solver = getDefaultSolver()
        const condition: VariabilityExpression = {max_length: ['hallo', 4]}
        solver.evaluateValueExpression(condition, {})
        expect(condition._cached_result).to.equal(false)
    })

    it('cache: cached', () => {
        const solver = getDefaultSolver()
        const result = solver.evaluateValueExpression({max_length: ['hallo', 4], _cached_result: 'cached'}, {})
        expect(result).to.equal('cached')
    })
})
