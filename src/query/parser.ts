import * as files from '../utils/files'
import {Template} from '../repository/templates';
import ohm from 'ohm-js';
import extras from 'ohm-js/extras';
import * as fs from 'fs';

export class Parser {

    grammar: ohm.Grammar
    serviceTemplate: Template

    constructor() {
        const grammarFile = fs.readFileSync('src/query/queryGrammar.ohm', 'utf-8')
        this.grammar = ohm.grammar(grammarFile)
    }


    parse(query: string) {
        let tree
        const match = this.grammar.match(query)
        if (match.succeeded()) {
            tree = extras.toAST(this.grammar.match(query))
        } else {
            console.log(`Unable to parse query: \n ${match.message}`)
            return
        }
        this.parseFrom(tree[0][0][1])
    }

    /**
     * Loads the template or instance in the FROM clause
     * @param path
     */

    parseFrom(path: string) {
        try {
            this.serviceTemplate = files.loadFile(new Template(path).getVariableServiceTemplatePath())
        } catch (error) {
            console.error(`Could not locate service template ${path}`)
        }
    }
}
