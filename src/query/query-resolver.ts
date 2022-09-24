import {Parser} from './parser';
import {Template, Templates} from '../repository/templates';
import {Instance} from '../repository/instances';
import {
    ConditionExpression,
    Expression,
    FromExpression, MatchExpression, NodeExpression, PredicateExpression,
    SelectExpression, StepExpression
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
            let result = []
            if (expression.match != null) {
                result = this.evaluateMatch(t.template, expression.match)
            }
            try {
                result.push(this.evaluateSelect(t.template,expression.select))
            } catch (e) {
                console.error(e)
                result = null
            }
            if (result) {
                results.push({name: t.name, result: result.flat()})
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
            console.error(`Could not locate service template ${expression.template}`)
        }
        return serviceTemplates
    }

    evaluateSelect(data: Object, expression: SelectExpression) {
        const results = []
        for (const p of expression.path) {
            let result = data
            for (const i of p.steps) {
                if (i.type == 'Group') {
                    result = this.evaluateGroup(result, i.path)
                } else if (i.type == 'Policy') {
                    result = this.evaluatePolicy(result, i.path)
                } else if (i.path == "*") {
                    result = this.evaluateWildcard(result, i.condition)
                } else {
                    result = this.evaluateStep(result, i)
                }
            }
            results.push(result)
        }
        return results
    }

    evaluateMatch(data: Object, expression: MatchExpression) {
        const matchingNodes = [{name: expression.start.name, data: this.evaluateNode(data, expression.start)}]
        for (const s of expression.steps) {
            console.log(s)
            matchingNodes.push({
                name: s.target.name,
                data: this.evaluateNode(data, s.target)
            })
        }
        console.log(matchingNodes)
        return matchingNodes
    }

    evaluateMatchStep(result: Object, step: string) {
        return result
    }

    evaluateNode(data: Object, expression: NodeExpression) {
        console.log("Evaluate " + expression.name)
        let result
        const path = 'topology_template.node_templates.' + expression.name
        result = this.resolvePath(path, data)
        if (expression.predicate) {
            result = this.evaluatePredicate(result, expression.predicate)
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
        if (condition.type == 'Existence') {
            return (Object.getOwnPropertyDescriptor(data, condition.variable)) ? data : null
        }
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

    evaluateWildcard(data: Object, condition?: PredicateExpression) {
        const result = []
        for (const node of Object.values(data)) {
            if (condition) {
                if (this.evaluatePredicate(node, condition))
                    result.push(node)
            } else {
                result.push(node)
            }
        }
        return result
    }

    evaluateStep(data: Object, step: StepExpression) {
        if (Array.isArray(data)) {
            const result = []
            for (const node of data) {
                if (Object.getOwnPropertyDescriptor(node, step.path)) {
                    result.push(node[step.path])
                }
            }
            return result
        } else {
            return (Object.getOwnPropertyDescriptor(data, step.path)) ? data[step.path] : null
        }
    }

    evaluateGroup(data: Object, name: string) {
        const groupNodes = data['topology_template']['groups']?.[name]?.['members']
        if (groupNodes == undefined) {
            throw new Error(`Could not find group ${name}`)
        }
        const result = {}
        for (const i of groupNodes) {
            result[i] = data['topology_template']['node_templates'][i]
        }
        return result;
    }

    evaluatePolicy(data: Object, name: string) {
        const policyNodes = data['topology_template']['policies']?.[0]?.[name]?.['targets']
        if (policyNodes == undefined) {
            throw new Error(`Could not find policy ${name}`)
        }
        const result = {}
        for (const i of policyNodes) {
            result[i] = data['topology_template']['node_templates'][i]
        }
        return result;
    }

    resolvePath(path, obj) {
        return path.split('.').reduce(function(prev, curr) {
            return prev ? prev[curr] : null
        }, obj || self)
    }
}
