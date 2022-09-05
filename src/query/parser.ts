import ohm from 'ohm-js';
import * as fs from 'fs';

export class Parser {

    grammar: ohm.Grammar
    semantics: ohm.Semantics

    /** Set of actions to pass to the Ohm library to build the syntax tree of the query */
    actions = {
        Main(a, _) {
            return a.buildAST()
        },
        Expression(from, select) {
            return {type: 'Expression', from: from.buildAST(), select: select.buildAST()}
        },
        MatchExpression(from, match) {
            return {type: 'Expression', from: from.buildAST(), match: match.buildAST()}
        },
        From(_, template) {
            return {type: 'From', value: template.buildAST()}
        },
        Select(_, step) {
            return {type: 'Select', value: step.buildAST().join()}
        },
        Step(path, condition) {
            return path.buildAST()
        },
        Condition(a_, value1, comparison, value2, b_) {
            return {type: 'Comparison', value: value1.buildAST() + comparison.buildAST() + value2.buildAST()}
        },
        Match(node1, relationship, node2) {
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
        path(a, b, c) {
            return [a, c].map((v) => v.sourceString).join('')
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
        _iter(...children) {
            return children.map(c => c.buildAST());
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
