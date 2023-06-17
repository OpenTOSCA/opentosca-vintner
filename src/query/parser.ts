import * as files from '#files'
import {parseInt} from 'lodash'
import ohm from 'ohm-js'
import path from 'path'
import {
    ConditionExpression,
    Expression,
    FromExpression,
    MatchExpression,
    PathExpression,
    PredicateExpression,
    RelationshipExpression,
    ReturnExpression,
    SelectExpression,
    StepExpression,
    VariableExpression,
} from './types'

/**
 * Parses Query4TOSCA expressions and returns an abstract syntax tree for further processing
 * @param query The query string input by the user
 * @param startRule The rule from which to start matching
 */
export function parse(query: string, startRule?: string) {
    const match = grammar.match(query, startRule)
    if (match.succeeded()) return semantics(match).buildAST()
    throw new Error(`Unable to parse query: \n ${match.message}`)
}

const grammar = ohm.grammar(files.loadFile(path.join(__dirname, '..', 'assets', 'grammar.ohm')))
const semantics = grammar.createSemantics()
semantics.addOperation('buildAST', {
    Main(a, _) {
        return a.buildAST()
    },
    Expression(from, select): Expression {
        return {type: 'Expression', from: from.buildAST(), select: select.buildAST()}
    },
    MatchExpression(from, match, select) {
        return {type: 'Expression', from: from.buildAST(), match: match.buildAST(), select: select.buildAST()}
    },
    FromExpression(_, type, __, path): FromExpression {
        let nodeType: 'Instance' | 'Template' = 'Template'
        if (type.sourceString.toLowerCase() == 'instance') nodeType = 'Instance'
        return {type: nodeType, path: path.sourceString}
    },
    Select(_, firstPath, __, addPath): SelectExpression {
        return {type: 'Select', path: [firstPath.buildAST()].concat(addPath.buildAST())}
    },
    Path(firstStep, nextSteps, returnClause): PathExpression {
        let steps = [firstStep.buildAST()].concat(nextSteps.buildAST()).flat()
        if (isPathShortcut(firstStep.sourceString)) {
            steps = [{type: 'Step', path: 'topology_template'}].concat(steps.flat())
        } else if (firstStep.sourceString == '.') {
            steps = []
        }
        return {type: 'Path', steps: steps, returnVal: returnClause.buildAST()[0]}
    },
    Map(_, path): StepExpression[] {
        return path.buildAST()
    },
    Filter(predicate): StepExpression {
        return {type: 'Condition', condition: predicate.buildAST()}
    },
    Step(shortcut, path): StepExpression[] {
        const result: StepExpression[] =
            shortcut.sourceString != '' ? [{type: 'Step', path: getShortcut(shortcut.sourceString)}] : []
        return result.concat({type: 'Step', path: path.buildAST()})
    },
    ArrayAccess(_, index, __): StepExpression {
        return {type: 'Array', index: index.buildAST()}
    },
    ReturnClause(_, pair1, __, pair2, ___): ReturnExpression {
        return {type: 'Return', keyValuePairs: [pair1.buildAST()].concat(pair2.buildAST())}
    },
    KeyValuePair_complex(key, _, value): {key: VariableExpression; value: VariableExpression} {
        return {key: key.buildAST(), value: value.buildAST()}
    },
    KeyValuePair_simple(value): {key: VariableExpression; value: VariableExpression} {
        return {key: {text: value.sourceString, isString: true}, value: value.buildAST()}
    },
    Group(_, __, groupName, ___): StepExpression {
        return {type: 'Group', path: groupName.sourceString}
    },
    Policy(_, __, policyName, ___): StepExpression {
        return {type: 'Policy', path: policyName.sourceString}
    },
    PredicateExpression(_, p, __): PredicateExpression {
        return p.buildAST()
    },
    Predicate_multi(a, v, b): PredicateExpression {
        return {type: 'Predicate', a: a.buildAST(), operator: v.sourceString, b: b.buildAST()}
    },
    Predicate_single(a): PredicateExpression {
        return {type: 'Predicate', a: a.buildAST()}
    },
    Condition_comparison(negation, variable, operator, value): ConditionExpression {
        return {
            type: 'Comparison',
            negation: negation.buildAST(),
            variable: variable.buildAST(),
            operator: operator.buildAST(),
            value: value.buildAST(),
        }
    },
    Condition_existence(negation, variable): ConditionExpression {
        return {
            type: 'Existence',
            negation: negation.buildAST(),
            variable: variable.buildAST(),
        }
    },
    Match(_, firstNode, relationships, addNodes): MatchExpression {
        return {
            type: 'Match',
            nodes: [firstNode.buildAST()].concat(addNodes.buildAST()),
            relationships: relationships.buildAST(),
        }
    },
    Node(_, name, predicate, __) {
        return predicate.sourceString != ''
            ? {type: 'Node', name: name.sourceString, predicate: predicate.buildAST()[0]}
            : {type: 'Node', name: name.sourceString}
    },
    Relationship_simple(arrowLeft, arrowRight): RelationshipExpression {
        const direction = getArrowDirection(arrowLeft.sourceString + arrowRight.sourceString)
        return {type: 'Relationship', direction: direction}
    },
    Relationship_cond(arrowLeft, _, variable, predicate, cardinality, __, arrowRight): RelationshipExpression {
        const direction = getArrowDirection(arrowLeft.sourceString + arrowRight.sourceString)
        return {
            type: 'Relationship',
            direction: direction,
            variable: variable.sourceString,
            cardinality: cardinality.buildAST()[0],
            predicate: predicate.buildAST()[0],
        }
    },
    Cardinality_range(asterisk, min, _, max) {
        return {min: min.buildAST(), max: max.buildAST()}
    },
    Cardinality_max(asterisk, _, max) {
        return {min: 0, max: max.buildAST()}
    },
    Cardinality_min(asterisk, min, _) {
        return {min: min.buildAST(), max: 99}
    },
    Cardinality_exact(asterisk, number) {
        return {min: number.buildAST(), max: number.buildAST()}
    },
    Cardinality_unlimited(asterisk) {
        return {min: 0, max: 99}
    },
    Variable(v): VariableExpression {
        return {text: v.buildAST(), isString: v.sourceString.startsWith("'") || v.sourceString.startsWith('"')}
    },
    Value(shortcut, v) {
        const shortcutString = getShortcut(shortcut.sourceString)
        return (shortcutString != '' ? shortcutString + '.' : '') + v.buildAST()
    },
    negation(v) {
        return v.sourceString == '!'
    },
    comparison(v) {
        return v.sourceString
    },
    ident(a, b) {
        return [a, b].map(v => v.sourceString).join('')
    },
    literal(v) {
        return v.buildAST()
    },
    bool(b) {
        return {type: 'bool', value: b.sourceString.toLowerCase() === 'true'}
    },
    string(start, s, end) {
        return s.sourceString
    },
    float(a, b, c) {
        return parseFloat(a.sourceString + b.sourceString + c.sourceString)
    },
    integer(i) {
        return parseInt(i.sourceString)
    },
    path(a, b) {
        return a.sourceString + b.sourceString
    },
    asterisk(v) {
        return '*'
    },
    _iter(...children) {
        return children.map(c => c.buildAST())
    },
    _terminal() {
        return ''
    },
})

function getShortcut(shortcut: string): string {
    switch (shortcut) {
        case '#':
            return 'properties'
        case '@':
            return 'attributes'
        case '$':
            return 'requirements'
        case '%':
            return 'capabilities'
        default:
            return ''
    }
}

function getArrowDirection(arrow: string) {
    switch (arrow) {
        case '-->':
            return 'out'
        case '<--':
            return 'in'
        default:
            return 'both'
    }
}

/**
 * Determines if a given path is a child of 'topology_template', so that 'topology_template' can be automatically added
 * to the beginning of the path without the user needing to specify it
 */
function isPathShortcut(path: string) {
    return ['groups', 'inputs', 'node_templates', 'outputs', 'policies', 'relationship_templates'].includes(path)
}
