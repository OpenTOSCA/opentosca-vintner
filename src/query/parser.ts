import ohm from 'ohm-js';
import * as fs from 'fs';
import {
    ConditionExpression,
    Expression,
    FromExpression,
    MatchExpression,
    PathExpression,
    PredicateExpression,
    RelationshipExpression,
    SelectExpression,
    StepExpression
} from '../specification/query-type';

export class Parser {

    grammar: ohm.Grammar
    semantics: ohm.Semantics

    /** Set of actions to pass to the Ohm library to build the syntax tree of the query */
    actions = {
        Main(a, _) {
            return a.buildAST()
        },
        Expression(from, select): Expression {
            return {type: 'Expression', from: from.buildAST(), select: select.buildAST()}
        },
        MatchExpression(from, match, select) {
            return {type: 'Expression', from: from.buildAST(), match: match.buildAST(), select: select.buildAST()}
        },
        FromInstance(_, template, __, instance): FromExpression {
            return {type: 'From', template: template.buildAST(), instance: instance.buildAST()}
        },
        FromTemplate(_, template): FromExpression {
            return {type: 'From', template: template.buildAST()}
        },
        Select(_, firstPath, __, addPath): SelectExpression {
            return {type: 'Select', path: [firstPath.buildAST()].concat(addPath.buildAST())}
        },
        Path(firstStep, __, nextSteps): PathExpression {
            return {type: 'Path', steps: [firstStep.buildAST()].concat(nextSteps.buildAST())}
        },
        Step(path): StepExpression {
            return {type: 'Step', path: path.buildAST()}
        },
        StepCond(path, condition): StepExpression {
            return {type: 'Step', path: path.buildAST(), condition: condition.buildAST()}
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
        Condition_comparison(shortcut, variable, operator, value): ConditionExpression {
            return {
                type: 'Comparison',
                variable: getShortcut(shortcut.sourceString).concat(variable.buildAST()),
                operator: operator.buildAST(),
                value: value.buildAST()
            }
        },
        Condition_existence(shortcut, variable): ConditionExpression {
            return {
                type: 'Existence',
                variable: getShortcut(shortcut.sourceString).concat(variable.buildAST())
            }
        },
        Match(_, firstNode, relationships, addNodes): MatchExpression {
            return {type: 'Match', nodes: [firstNode.buildAST()].concat(addNodes.buildAST()), relationships: relationships.buildAST()}
        },
        Node(_, name, predicate, __) {
            return (predicate.sourceString != "")? {type: 'Node', name: name.sourceString, predicate: predicate.buildAST()[0]}
                : {type: 'Node', name: name.sourceString}
        },
        Relationship(arrow1, condition, arrow2): RelationshipExpression {
            const direction = getArrowDirection(arrow1.sourceString + arrow2.sourceString)
            return {type: 'Relationship', direction: direction, condition: condition.buildAST()[0]}
        },
        RelationshipFilter(_, name, predicate, __): PredicateExpression {
            return predicate.buildAST()[0]
        },
        Value(v) {
            return v.buildAST()
        },
        comparison(v) {
            return v.sourceString
        },
        ident(a, b) {
            return [a, b].map((v) => v.sourceString).join('')
        },
        literal(v) {
            return v.buildAST()
        },
        bool(b) {
            return { type: 'bool', value: b.sourceString.toLowerCase() === 'true' };
        },
        string(start, s, end) {
            return s.sourceString
        },
        float(a, b, c) {
            return parseFloat(a + b + c)
        },
        path(a, b) {
            return [a, b].map((v) => v.sourceString).join('')
        },
        asterisk(v) {
            return '*'
        },
        _iter(...children) {
            return children.map(c => c.buildAST());
        },
        _terminal() {
            return ''
        }
    }

    /** Loads the Ohm grammar from a file, initializes the grammar and the semantic actions */
    constructor() {
        const grammarFile = fs.readFileSync('src/query/queryGrammar.ohm', 'utf-8')
        this.grammar = ohm.grammar(grammarFile)
        this.semantics = this.grammar.createSemantics()
        this.semantics.addOperation('buildAST', this.actions)
    }

    /**
     * Returns an abstract syntax tree that represents the given query
     * @param query The query string input by the user
     */
    getAST(query: string) {
        let tree
        const match = this.grammar.match(query)
        if (match.succeeded()) {
            tree = this.semantics(match).buildAST()
        } else {
            throw new Error(`Unable to parse query: \n ${match.message}`)
        }
        return tree
    }
}

function getShortcut(shortcut: string) {
    switch (shortcut) {
        case '#':
            return 'properties.'
        case '@':
            return 'attributes.'
        case '$':
            return 'requirements.'
        case '%':
            return 'capabilities.'
        default:
            return ''
    }
}

function getArrowDirection(arrow: string) {
    switch (arrow) {
        case '-->':
            return 'right'
        case '<--':
            return 'left'
        default:
            return 'both'
    }
}
