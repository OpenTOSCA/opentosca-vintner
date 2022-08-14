import {Model} from '../src/repository/model'
import {expect} from 'chai'

it('expression name -> true', () => {
    const model = new Model({
        topology_template: {
            variability: {
                expressions: {
                    name: true,
                },
            },
        },
    } as any)
    const result = model.evaluateVariabilityCondition({get_variability_expression: 'name'})
    expect(result).to.equal(true)
})

it('condition name -> true', () => {
    const model = new Model({
        topology_template: {
            variability: {
                expressions: {
                    name: true,
                },
            },
        },
    } as any)
    const result = model.evaluateVariabilityCondition({get_variability_condition: 'name'})
    expect(result).to.equal(true)
})

it('and: true -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({and: [true, true, true, true]})
    expect(result).to.equal(true)
})

it('and: false -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({and: [true, false, true, true]})
    expect(result).to.equal(false)
})

it('and: and true -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({and: [{and: [true, true]}, true]})
    expect(result).to.equal(true)
})

it('and: and false -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({and: [{and: [true, false]}, true]})
    expect(result).to.equal(false)
})

it('or: all true -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({or: [true, true, true, true]})
    expect(result).to.equal(true)
})

it('or: one false -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({or: [true, true, false, true]})
    expect(result).to.equal(true)
})

it('or: all false -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({or: [false, false, false, false]})
    expect(result).to.equal(false)
})

it('not: false -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({not: false})
    expect(result).to.equal(true)
})

it('not: true -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({not: true})
    expect(result).to.equal(false)
})

it('xor: one true -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({xor: [true, false, false, false]})
    expect(result).to.equal(true)
})

it('xor: all false -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({xor: [false, false, false, false]})
    expect(result).to.equal(false)
})

it('xor: all true -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({xor: [true, true, true, true]})
    expect(result).to.equal(false)
})

it('implies: all true -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({implies: [true, true]})
    expect(result).to.equal(true)
})

it('implies: left true and right false -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({implies: [true, false]})
    expect(result).to.equal(false)
})

it('implies: left false and right false -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({implies: [false, false]})
    expect(result).to.equal(true)
})

it('implies: left false and right true -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({implies: [false, true]})
    expect(result).to.equal(true)
})

it('add: correct -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({add: [10, 1, 1, 1, 1, 1]})
    expect(result).to.equal(15)
})

it('sub: correct -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({sub: [10, 1, 1, 1, 1, 1]})
    expect(result).to.equal(5)
})

it('mul: correct -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({mul: [10, 1, 3, 4]})
    expect(result).to.equal(120)
})

it('div: correct -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({div: [10, 1, 2, 5]})
    expect(result).to.equal(1)
})

it('mod: 0 -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({mod: [10, 2]})
    expect(result).to.equal(0)
})

it('mod: 1 -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({mod: [11, 2]})
    expect(result).to.equal(1)
})

it('get_variability_input', () => {
    const model = new Model({} as any)
    model.setVariabilityInputs({hello: 'world'})
    const result = model.evaluateVariabilityConditionRunner({get_variability_input: 'hello'})
    expect(result).to.equal('world')
})

it('concat', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({concat: ['hello', ' ', 'world']})
    expect(result).to.equal('hello world')
})

it('join', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({join: [['hello', 'world'], ' ']})
    expect(result).to.equal('hello world')
})

it('token', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({token: ['hello world', ' ', 1]})
    expect(result).to.equal('world')
})

it('equal true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({equal: [1, 1, 1]})
    expect(result).to.equal(true)
})

it('equal false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({equal: [1, 1, 2]})
    expect(result).to.equal(false)
})

it('greater_than: greater -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({greater_than: [2, 1]})
    expect(result).to.equal(true)
})

it('greater_than: equal -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({greater_than: [1, 1]})
    expect(result).to.equal(false)
})

it('greater_than: less -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({greater_than: [0, 1]})
    expect(result).to.equal(false)
})

it('greater_or_equal: greater -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({greater_or_equal: [2, 1]})
    expect(result).to.equal(true)
})

it('greater_or_equal: equal -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({greater_or_equal: [1, 1]})
    expect(result).to.equal(true)
})

it('greater_or_equal: less -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({greater_or_equal: [0, 1]})
    expect(result).to.equal(false)
})

it('less_than: greater -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({less_than: [2, 1]})
    expect(result).to.equal(false)
})

it('less_than: equal -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({less_than: [1, 1]})
    expect(result).to.equal(false)
})

it('less_than: less -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({less_than: [0, 1]})
    expect(result).to.equal(true)
})

it('less_or_equal: greater -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({less_or_equal: [2, 1]})
    expect(result).to.equal(false)
})

it('less_or_equal: equal -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({less_or_equal: [1, 1]})
    expect(result).to.equal(true)
})

it('less_or_equal: less -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({less_or_equal: [0, 1]})
    expect(result).to.equal(true)
})

it('in_range: true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({in_range: [1, [0, 1]]})
    expect(result).to.equal(true)
})

it('in_range: false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({in_range: [2, [0, 1]]})
    expect(result).to.equal(false)
})

it('valid_values: true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({valid_values: [1, [0, 1]]})
    expect(result).to.equal(true)
})

it('valid_values: false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({valid_values: [2, [0, 1]]})
    expect(result).to.equal(false)
})

it('length: too long -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({length: ['hallo', 4]})
    expect(result).to.equal(false)
})

it('length: true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({length: ['hallo', 5]})
    expect(result).to.equal(true)
})

it('min_length: less -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({min_length: ['hallo', 6]})
    expect(result).to.equal(false)
})

it('min_length: exact -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({min_length: ['hallo', 5]})
    expect(result).to.equal(true)
})

it('min_length: more -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({min_length: ['hallo', 4]})
    expect(result).to.equal(true)
})

it('max_length: less -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({max_length: ['hallo', 6]})
    expect(result).to.equal(true)
})

it('max_length: exact -> true', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({max_length: ['hallo', 5]})
    expect(result).to.equal(true)
})

it('max_length: more -> false', () => {
    const model = new Model({} as any)
    const result = model.evaluateVariabilityConditionRunner({max_length: ['hallo', 4]})
    expect(result).to.equal(false)
})
