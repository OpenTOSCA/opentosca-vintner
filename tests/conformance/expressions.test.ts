import {expect} from 'chai'
import {VariabilityResolver} from '#controller/template/resolve'
import {VariabilityExpression} from '#spec/variability'

function getDefaultVariabilityResolver() {
    return new VariabilityResolver({} as any)
}

describe('expressions', () => {
    it('or: empty -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({or: []}, {})
        expect(result).to.equal(false)
    })

    it('or: all true -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({or: [true, true, true, true]}, {})
        expect(result).to.equal(true)
    })

    it('or: one false -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({or: [true, true, false, true]}, {})
        expect(result).to.equal(true)
    })

    it('or: all false -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({or: [false, false, false, false]}, {})
        expect(result).to.equal(false)
    })

    it('not: false -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({not: false}, {})
        expect(result).to.equal(true)
    })

    it('not: true -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({not: true}, {})
        expect(result).to.equal(false)
    })

    it('xor: one true -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({xor: [true, false, false, false]}, {})
        expect(result).to.equal(true)
    })

    it('xor: all false -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({xor: [false, false, false, false]}, {})
        expect(result).to.equal(false)
    })

    it('xor: all true -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({xor: [true, true, true, true]}, {})
        expect(result).to.equal(false)
    })

    it('implies: all true -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({implies: [true, true]}, {})
        expect(result).to.equal(true)
    })

    it('implies: left true and right false -> false', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({implies: [true, false]}, {})
        expect(result).to.equal(false)
    })

    it('implies: left false and right false -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({implies: [false, false]}, {})
        expect(result).to.equal(true)
    })

    it('implies: left false and right true -> true', () => {
        const resolver = getDefaultVariabilityResolver()
        const result = resolver.evaluateVariabilityExpression({implies: [false, true]}, {})
        expect(result).to.equal(true)
    })

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

    it('get_node_presence: node absent', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                node_templates: {
                    node: {
                        conditions: false,
                    },
                },
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({get_node_presence: 'node'}, {})
        expect(result).to.equal(false)
    })

    it('get_relation_presence: relation by name absent', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                node_templates: {
                    node: {
                        requirements: [
                            {
                                relation: {
                                    node: 'another_node',
                                    conditions: false,
                                },
                            },
                            {
                                another_relation: {
                                    node: 'another_node',
                                    conditions: true,
                                },
                            },
                        ],
                    },
                    another_node: {},
                },
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({get_relation_presence: ['node', 'relation']}, {})
        expect(result).to.equal(false)
    })

    it('get_relation_presence: relation by index absent', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                node_templates: {
                    node: {
                        requirements: [
                            {
                                relation: {
                                    node: 'another_node',
                                    conditions: false,
                                },
                            },
                            {
                                another_relation: {
                                    node: 'another_node',
                                    conditions: true,
                                },
                            },
                        ],
                    },
                    another_node: {},
                },
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({get_relation_presence: ['node', 0]}, {})
        expect(result).to.equal(false)
    })

    it('get_source_presence: present', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                node_templates: {
                    node: {
                        conditions: true,
                        requirements: [
                            {
                                relation: {
                                    node: 'another_node',
                                    conditions: {get_source_presence: 'SELF'},
                                },
                            },
                        ],
                    },
                    another_node: {},
                },
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({get_relation_presence: ['node', 'relation']}, {})
        expect(result).to.equal(true)
    })

    it('get_source_presence: absent', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                node_templates: {
                    node: {
                        conditions: false,
                        requirements: [
                            {
                                relation: {
                                    node: 'another_node',
                                    conditions: {get_source_presence: 'SELF'},
                                },
                            },
                        ],
                    },
                    another_node: {},
                },
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({get_relation_presence: ['node', 'relation']}, {})
        expect(result).to.equal(false)
    })

    it('get_target_presence: present', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                node_templates: {
                    node: {
                        requirements: [
                            {
                                relation: {
                                    node: 'another_node',
                                    conditions: {get_target_presence: 'SELF'},
                                },
                            },
                        ],
                    },
                    another_node: {
                        conditions: true,
                    },
                },
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({get_relation_presence: ['node', 'relation']}, {})
        expect(result).to.equal(true)
    })

    it('get_target_presence: absent', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                node_templates: {
                    node: {
                        requirements: [
                            {
                                relation: {
                                    node: 'another_node',
                                    conditions: {get_target_presence: 'SELF'},
                                },
                            },
                        ],
                    },
                    another_node: {
                        conditions: false,
                    },
                },
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({get_relation_presence: ['node', 'relation']}, {})
        expect(result).to.equal(false)
    })

    it('has_present_targets: no targets -> false', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                policies: [
                    {
                        policy: {
                            type: 'policy',
                            targets: [],
                        },
                    },
                ],
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({has_present_targets: 'policy'}, {})
        expect(result).to.equal(false)
    })

    it('has_present_targets: false false false true -> true', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                node_templates: {
                    node_one: {
                        conditions: false,
                    },
                    node_two: {
                        conditions: false,
                    },
                    node_three: {
                        conditions: false,
                    },
                    node_four: {
                        conditions: true,
                    },
                },
                groups: {
                    group_one: {
                        members: ['node_three', 'node_four'],
                    },
                },
                policies: [
                    {
                        policy: {
                            type: 'policy',
                            targets: ['node_one', 'node_two', 'group_one'],
                        },
                    },
                ],
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({has_present_targets: 'policy'}, {})
        expect(result).to.equal(true)
    })

    it('has_present_targets: group false false -> false', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                node_templates: {
                    node_one: {
                        conditions: false,
                    },
                    node_two: {
                        conditions: false,
                    },
                    node_three: {
                        conditions: false,
                    },
                    node_four: {
                        conditions: false,
                    },
                },
                groups: {
                    group_one: {
                        members: ['node_three', 'node_four'],
                    },
                },
                policies: [
                    {
                        policy: {
                            type: 'policy',
                            targets: ['node_one', 'node_two', 'group_one'],
                        },
                    },
                ],
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({has_present_targets: 'policy'}, {})
        expect(result).to.equal(false)
    })

    it('has_present_targets: true false -> true', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                node_templates: {
                    node_one: {
                        conditions: true,
                    },
                    node_two: {
                        conditions: false,
                    },
                },
                policies: [
                    {
                        policy: {
                            type: 'policy',
                            targets: ['node_one', 'node_two'],
                        },
                    },
                ],
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({has_present_targets: 'policy'}, {})
        expect(result).to.equal(true)
    })

    it('has_present_targets: false false -> false', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                node_templates: {
                    node_one: {
                        conditions: false,
                    },
                    node_two: {
                        conditions: false,
                    },
                },
                policies: [
                    {
                        policy: {
                            type: 'policy',
                            targets: ['node_one', 'node_two'],
                        },
                    },
                ],
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({has_present_targets: 'policy'}, {})
        expect(result).to.equal(false)
    })

    it('has_present_members: true true -> true', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                node_templates: {
                    node_one: {
                        conditions: true,
                    },
                    node_two: {
                        conditions: true,
                    },
                },
                groups: {
                    group_one: {
                        members: ['node_one', 'node_two'],
                    },
                },
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({has_present_members: 'group_one'}, {})
        expect(result).to.equal(true)
    })

    it('has_present_members: true false -> true', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                node_templates: {
                    node_one: {
                        conditions: true,
                    },
                    node_two: {
                        conditions: false,
                    },
                },
                groups: {
                    group_one: {
                        members: ['node_one', 'node_two'],
                    },
                },
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({has_present_members: 'group_one'}, {})
        expect(result).to.equal(true)
    })

    it('has_present_members: false false -> true', () => {
        const resolver = new VariabilityResolver({
            topology_template: {
                node_templates: {
                    node_one: {
                        conditions: false,
                    },
                    node_two: {
                        conditions: false,
                    },
                },
                groups: {
                    group_one: {
                        members: ['node_one', 'node_two'],
                    },
                },
            },
        } as any)
        const result = resolver.evaluateVariabilityCondition({has_present_members: 'group_one'}, {})
        expect(result).to.equal(false)
    })

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
