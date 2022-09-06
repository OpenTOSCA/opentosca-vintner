import {Parser} from './parser';
import {Template} from '../repository/templates';
import {Instance} from '../repository/instances';
import {
    ConditionExpression,
    Expression,
    FromExpression,
    SelectExpression
} from '../specification/query-type';

export class QueryResolver {

    resolve(query: string) {
        const parser = new Parser
        let tree
        try {
            tree = parser.getAST(query)
        } catch (e) {
            console.error(e.message)
        }
        console.log("Generated the following AST: ")
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
    evaluateFrom(expression: FromExpression) {
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

    evaluateSelect(data: Object, expression: SelectExpression) {
        let result = data
        for (const i of expression.path) {
            if (i.condition) {
                if (i.path == "*") {
                    for (const j in result) {
                        if (!this.evaluateCondition(result[j], i.condition)) {
                            delete result[j]
                        }
                    }
                } else {
                    result = this.evaluateCondition(result[i.path], i.condition)
                }
            } else {
                result = result[i.path]
            }
        }
        return result
    }

    evaluateCondition(data: Object, condition: ConditionExpression) {
        const {variable, value, operator} = condition
        const property = this.resolvePath(variable, data)
        switch (operator) {
            case '=':
                return ((property == value)? data : null)
            case '!=':
                return ((property !== value)? data : null)
            case '>=':
                return ((property >= value)? data : null)
            case '>':
                return ((property > value)? data : null)
            case '<=':
                return ((property <= value)? data : null)
            case '<':
                return ((property < value)? data : null)
        }
        return null
    }

    resolvePath(path, obj) {
        return path.split('.').reduce(function(prev, curr) {
            return prev ? prev[curr] : null
        }, obj || self)
    }
}
