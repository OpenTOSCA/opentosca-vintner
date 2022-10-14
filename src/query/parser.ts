import ohm, {ActionDict} from 'ohm-js';
import * as fs from 'fs';
import {
    ConditionExpression,
    Expression,
    FromExpression,
    MatchExpression,
    PathExpression,
    PredicateExpression,
    RelationshipExpression, ReturnExpression,
    SelectExpression,
    StepExpression, VariableExpression
} from '../specification/query-type';

export class Parser {

    grammar: ohm.Grammar
    semantics: ohm.Semantics

    /** Set of actions to pass to the Ohm library to build the syntax tree of the query */
    actions: ActionDict<any> = {
        Main(a, _) {
            return a.buildAST()
        },
        Expression(from, select): Expression {
            return {type: 'Expression', from: from.buildAST(), select: select.buildAST()}
        },
        MatchExpression(from, match, select) {
            return {type: 'Expression', from: from.buildAST(), match: match.buildAST(), select: select.buildAST()}
        },
        FromExpression(_, type, __,  path): FromExpression {
            let nodeType: 'Instance' | 'Template' = 'Template'
            if (type.sourceString.toLowerCase() == 'instance') nodeType = 'Instance'
            return {type: nodeType, path: path.sourceString}
        },
        Select(_, firstPath, __, addPath): SelectExpression {
            return {type: 'Select', path: [firstPath.buildAST()].concat(addPath.buildAST())}
        },
        Path(firstStep, __, nextSteps, returnClause): PathExpression {
            let steps = [firstStep.buildAST()].concat(nextSteps.buildAST()).flat()
            if (isPathShortcut(firstStep.sourceString)) {
                steps = [{type: 'Step', path: 'topology_template'}].concat(steps.flat())
            } else if (firstStep.sourceString == '.') {
                steps = []
            }
            return {type: 'Path', steps: steps, returnVal: returnClause.buildAST()[0]}
        },
        Step(shortcut, path): StepExpression[] {
            const result: StepExpression[] = (shortcut.sourceString != '')?
                [{type: 'Step', path: getShortcut(shortcut.sourceString)}] : []
            return result.concat({type: 'Step', path: path.buildAST()})
        },
        StepCond(shortcut, path, condition): StepExpression {
            return {type: 'Step', path: path.buildAST(), condition: condition.buildAST()}
        },
        ReturnClause(_, pair1, __, pair2, ___): ReturnExpression {
            return {type: 'Return', keyValuePairs: [pair1.buildAST()].concat(pair2.buildAST())}
        },
        KeyValuePair(key, _, value): {key: VariableExpression, value: VariableExpression} {
            return {key: key.buildAST(), value: value.buildAST()[0]}
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
        Condition_comparison(variable, operator, value): ConditionExpression {
            return {
                type: 'Comparison',
                variable: variable.buildAST(),
                operator: operator.buildAST(),
                value: value.buildAST()
            }
        },
        Condition_existence(variable): ConditionExpression {
            return {
                type: 'Existence',
                variable: variable.buildAST()
            }
        },
        Match(_, firstNode, relationships, addNodes): MatchExpression {
            return {type: 'Match', nodes: [firstNode.buildAST()].concat(addNodes.buildAST()), relationships: relationships.buildAST()}
        },
        Node(_, name, predicate, __) {
            return (predicate.sourceString != "")? {type: 'Node', name: name.sourceString, predicate: predicate.buildAST()[0]}
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
                predicate: predicate.buildAST()[0]
            }
        },
        Cardinality(asterisk, number) {
            return (number.sourceString == '')? 99 : parseInt(number.sourceString)
        },
        Variable(v): VariableExpression {
            return {text: v.buildAST(), isString: (v.sourceString.startsWith('\'') || v.sourceString.startsWith('"'))}
        },
        Value(shortcut, v) {
            const shortcutString = getShortcut(shortcut.sourceString)
            return ((shortcutString != '')? (shortcutString + '.') : '') + v.buildAST()
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
            return parseFloat(a.sourceString + b.sourceString + c.sourceString)
        },
        path(a, b) {
            return a.sourceString + b.sourceString
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
        const grammarFile = fs.readFileSync('src/query/grammar.ohm', 'utf-8')
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
            return 'right'
        case '<--':
            return 'left'
        default:
            return 'both'
    }
}

function isPathShortcut(path: string) {
    return ['groups', 'inputs', 'node_templates', 'outputs', 'policies', 'relationship_templates'].includes(path)
}
