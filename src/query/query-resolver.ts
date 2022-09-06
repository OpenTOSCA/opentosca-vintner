import {Parser} from './parser';
import * as files from '../utils/files';
import {Template} from '../repository/templates';
import {Instance} from '../repository/instances';

type Expression = {
    type: string
    value: string
    template: string
    instance: string
    from: Expression
    select: Expression
}

export class QueryResolver {

    resolve(query: string) {
        const parser = new Parser
        let tree
        let result
        try {
            tree = parser.getAST(query)
        } catch (e) {
            console.error(e.message)
        }
        console.log("Got the following AST: ")
        console.log(JSON.stringify(tree, null, 4))

        return this.evaluate(tree);
    }

    /**
     * Generator function that evaluates a given expression
     * @param expression A node of the AST
     * @return result The data that matches the expression
     */
    evaluate(expression: Expression) {
        let result

        result = this.evaluateFrom(expression.from)
        result = this.evaluateSelect(result, expression.select)

        return result
    }

    /** Loads the template or instance in the FROM clause */
    evaluateFrom(expression: Expression) {
        let serviceTemplate
        try {
            if (expression.instance) {
                serviceTemplate = new Instance(expression.instance).getServiceTemplate()
            } else {
                serviceTemplate = new Template(expression.template).getVariableServiceTemplate()
            }
        } catch (error) {
            console.error('Could not locate service template')
        }
        return serviceTemplate
    }

    evaluateSelect(data: Object, expression: Expression) {
        return this.resolvePath(expression.value, data)
    }

    resolvePath(path, obj) {
        return path.split('.').reduce(function(prev, curr) {
            return prev ? prev[curr] : null
        }, obj || self)
    }
}
