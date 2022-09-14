import ohm from 'ohm-js';
import * as fs from 'fs';
import {
    ConditionExpression,
    Expression,
    FromExpression,
    PredicateExpression,
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
        MatchExpression(from, match) {
            return {type: 'Expression', from: from.buildAST(), match: match.buildAST()}
        },
        FromTemplate(_, template): FromExpression {
            return {type: 'From', template: template.buildAST()}
        },
        FromInstance(_, template, __, instance): FromExpression {
            return {type: 'From', template: template.buildAST(), instance: instance.buildAST()}
        },
        Select(_, firstStep, __, nextSteps): SelectExpression {
            return {type: 'Select', path: [firstStep.buildAST()].concat(nextSteps.buildAST())}
        },
        Step(path): StepExpression {
            return {type: 'Step', path: path.buildAST()}
        },
        StepCond(path, _, condition, __): StepExpression {
            return {type: 'Step', path: path.buildAST(), condition: condition.buildAST()}
        },
        Predicate_multi(a, v, b): PredicateExpression {
            return {type: 'Predicate', a: a.buildAST(), operator: v.sourceString, b: b.buildAST()}
        },
        Predicate_single(a): PredicateExpression {
            return {type: 'Predicate', a: a.buildAST()}
        },
        Condition(variable, operator, value): ConditionExpression{
            return {type: 'Condition', variable: variable.buildAST(), operator: operator.buildAST(), value: value.buildAST()}
        },
        Match(_, node1, relationship, node2) {
            return {type: 'Match', node1: node1.buildAST(), relationship: relationship, node2: node2.buildAST()}
        },
        Node(start, node, end) {
            return {type: 'Node', node: node.buildAST()}
        },
        Relationship(start, name, end) {
            return {type: 'relationship', value: name}
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
