import {expect} from 'chai'
import {VariabilityResolver} from '../src/controller/template/resolve'

it('expression name -> true', () => {
    const resolver = new VariabilityResolver({
        topology_template: {
            variability: {
                expressions: {
                    name: true,
                },
            },
        },
    } as any)
    const result = resolver.evaluateVariabilityCondition({get_variability_expression: 'name'})
    expect(result).to.equal(true)
})

it('condition name -> true', () => {
    const resolver = new VariabilityResolver({
        topology_template: {
            variability: {
                expressions: {
                    name: true,
                },
            },
        },
    } as any)
    const result = resolver.evaluateVariabilityCondition({get_variability_condition: 'name'})
    expect(result).to.equal(true)
})

it('and: true -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({and: [true, true, true, true]})
    expect(result).to.equal(true)
})

it('and: false -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({and: [true, false, true, true]})
    expect(result).to.equal(false)
})

it('and: and true -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({and: [{and: [true, true]}, true]})
    expect(result).to.equal(true)
})

it('and: and false -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({and: [{and: [true, false]}, true]})
    expect(result).to.equal(false)
})

it('or: all true -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({or: [true, true, true, true]})
    expect(result).to.equal(true)
})

it('or: one false -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({or: [true, true, false, true]})
    expect(result).to.equal(true)
})

it('or: all false -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({or: [false, false, false, false]})
    expect(result).to.equal(false)
})

it('not: false -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({not: false})
    expect(result).to.equal(true)
})

it('not: true -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({not: true})
    expect(result).to.equal(false)
})

it('xor: one true -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({xor: [true, false, false, false]})
    expect(result).to.equal(true)
})

it('xor: all false -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({xor: [false, false, false, false]})
    expect(result).to.equal(false)
})

it('xor: all true -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({xor: [true, true, true, true]})
    expect(result).to.equal(false)
})

it('implies: all true -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({implies: [true, true]})
    expect(result).to.equal(true)
})

it('implies: left true and right false -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({implies: [true, false]})
    expect(result).to.equal(false)
})

it('implies: left false and right false -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({implies: [false, false]})
    expect(result).to.equal(true)
})

it('implies: left false and right true -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({implies: [false, true]})
    expect(result).to.equal(true)
})

it('add: correct -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({add: [10, 1, 1, 1, 1, 1]})
    expect(result).to.equal(15)
})

it('sub: correct -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({sub: [10, 1, 1, 1, 1, 1]})
    expect(result).to.equal(5)
})

it('mul: correct -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({mul: [10, 1, 3, 4]})
    expect(result).to.equal(120)
})

it('div: correct -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({div: [10, 1, 2, 5]})
    expect(result).to.equal(1)
})

it('mod: 0 -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({mod: [10, 2]})
    expect(result).to.equal(0)
})

it('mod: 1 -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({mod: [11, 2]})
    expect(result).to.equal(1)
})

it('get_variability_input', () => {
    const resolver = new VariabilityResolver({} as any)
    resolver.setVariabilityInputs({hello: 'world'})
    const result = resolver.evaluateVariabilityConditionRunner({get_variability_input: 'hello'})
    expect(result).to.equal('world')
})

it('concat', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({concat: ['hello', ' ', 'world']})
    expect(result).to.equal('hello world')
})

it('join', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({join: [['hello', 'world'], ' ']})
    expect(result).to.equal('hello world')
})

it('token', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({token: ['hello world', ' ', 1]})
    expect(result).to.equal('world')
})

it('equal true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({equal: [1, 1, 1]})
    expect(result).to.equal(true)
})

it('equal false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({equal: [1, 1, 2]})
    expect(result).to.equal(false)
})

it('greater_than: greater -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({greater_than: [2, 1]})
    expect(result).to.equal(true)
})

it('greater_than: equal -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({greater_than: [1, 1]})
    expect(result).to.equal(false)
})

it('greater_than: less -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({greater_than: [0, 1]})
    expect(result).to.equal(false)
})

it('greater_or_equal: greater -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({greater_or_equal: [2, 1]})
    expect(result).to.equal(true)
})

it('greater_or_equal: equal -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({greater_or_equal: [1, 1]})
    expect(result).to.equal(true)
})

it('greater_or_equal: less -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({greater_or_equal: [0, 1]})
    expect(result).to.equal(false)
})

it('less_than: greater -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({less_than: [2, 1]})
    expect(result).to.equal(false)
})

it('less_than: equal -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({less_than: [1, 1]})
    expect(result).to.equal(false)
})

it('less_than: less -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({less_than: [0, 1]})
    expect(result).to.equal(true)
})

it('less_or_equal: greater -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({less_or_equal: [2, 1]})
    expect(result).to.equal(false)
})

it('less_or_equal: equal -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({less_or_equal: [1, 1]})
    expect(result).to.equal(true)
})

it('less_or_equal: less -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({less_or_equal: [0, 1]})
    expect(result).to.equal(true)
})

it('in_range: true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({in_range: [1, [0, 1]]})
    expect(result).to.equal(true)
})

it('in_range: false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({in_range: [2, [0, 1]]})
    expect(result).to.equal(false)
})

it('valid_values: true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({valid_values: [1, [0, 1]]})
    expect(result).to.equal(true)
})

it('valid_values: false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({valid_values: [2, [0, 1]]})
    expect(result).to.equal(false)
})

it('length: too long -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({length: ['hallo', 4]})
    expect(result).to.equal(false)
})

it('length: true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({length: ['hallo', 5]})
    expect(result).to.equal(true)
})

it('min_length: less -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({min_length: ['hallo', 6]})
    expect(result).to.equal(false)
})

it('min_length: exact -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({min_length: ['hallo', 5]})
    expect(result).to.equal(true)
})

it('min_length: more -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({min_length: ['hallo', 4]})
    expect(result).to.equal(true)
})

it('max_length: less -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({max_length: ['hallo', 6]})
    expect(result).to.equal(true)
})

it('max_length: exact -> true', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({max_length: ['hallo', 5]})
    expect(result).to.equal(true)
})

it('max_length: more -> false', () => {
    const resolver = new VariabilityResolver({} as any)
    const result = resolver.evaluateVariabilityConditionRunner({max_length: ['hallo', 4]})
    expect(result).to.equal(false)
})
