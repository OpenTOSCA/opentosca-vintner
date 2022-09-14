import {Parser} from './parser';
import {Template, Templates} from '../repository/templates';
import {Instance} from '../repository/instances';
import {
    ConditionExpression,
    Expression,
    FromExpression, PredicateExpression,
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
            process.exit(0);
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
        const results = []
        const templates = this.evaluateFrom(expression.from)
        for (const t of templates) {
            const result = this.evaluateSelect(t.template, expression.select)
            if (result) {
                results.push({name: t.name, result: result})
            }
        }
        return results
    }

    /** Loads the template or instance in the FROM clause */
    evaluateFrom(expression: FromExpression) {
        const serviceTemplates = []
        try {
            if (expression.instance) {
                serviceTemplates.push({name: expression.instance, template: new Instance(expression.instance).getServiceTemplate()})
            } else if (expression.template == '*') {
                for (const t of Templates.all()) {
                    serviceTemplates.push({name: t.getName(), template: t.getVariableServiceTemplate()})
                }
            } else {
                serviceTemplates.push({name: expression.template, template:new Template(expression.template).getVariableServiceTemplate()})
            }
        } catch (error) {
            console.error('Could not locate service template')
        }
        return serviceTemplates
    }

    evaluateSelect(data: Object, expression: SelectExpression) {
        let result = data
        for (const i of expression.path) {
            if (i.condition) {
                if (i.path == "*") {
                    for (const j in result) {
                        if (!this.evaluatePredicate(result[j], i.condition)) {
                            delete result[j]
                        }
                    }
                } else {
                    result = this.evaluatePredicate(result[i.path], i.condition)
                }
            } else {
                result = (Object.getOwnPropertyDescriptor(result, i.path)) ? result[i.path] : null
            }
        }
        return result
    }

    evaluatePredicate(data: Object, predicate: PredicateExpression) {
        const {a, operator, b} = predicate
        if (operator == null) {
            return this.evaluateCondition(data, a as ConditionExpression)
        } else if (operator == 'AND') {
            return this.evaluatePredicate(data, a as PredicateExpression)
            && this.evaluatePredicate(data, b as PredicateExpression)
        } else if (operator == 'OR') {
            return this.evaluatePredicate(data, a as PredicateExpression)
                || this.evaluatePredicate(data, b as PredicateExpression)
        }
        return null
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
