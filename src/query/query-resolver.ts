import {Parser} from './parser';
import {Template, Templates} from '../repository/templates';
import {Instance} from '../repository/instances';
import {
    ConditionExpression, Expression, FromExpression, MatchExpression, NodeExpression, PredicateExpression,
    RelationshipExpression, SelectExpression, StepExpression
} from '../specification/query-type';
import {ServiceTemplate} from '../specification/service-template';
import {NodeGraph} from './node-graph';
import {QueryTemplateArguments} from '../controller/query/query';
import * as files from '../utils/files'
import path from 'path';
import * as yaml from 'js-yaml';
import fs from 'fs';
import {NodeTemplate} from '../specification/node-template';

export class QueryResolver {
    private nodeGraph: NodeGraph
    private source: string
    private currentKeys: string[]

    resolve(query: QueryTemplateArguments) {
        const parser = new Parser
        let tree
        try {
            this.source = query.source
            tree = parser.getAST(query.query)
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
            let result = t.template
            if (expression.match != null) {
                result = this.evaluateMatch(result, expression.match)
            }
            try {
                result = this.evaluateSelect(result,expression.select)
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
            switch (this.source){
                case 'vintner':
                    if (expression.type == 'Instance') {
                        serviceTemplates.push({name: expression.instance, template: new Instance(expression.instance).getServiceTemplate()})
                    } else if (expression.type == 'Template' && expression.template == '*') {
                        for (const t of Templates.all()) {
                            serviceTemplates.push({name: t.getName(), template: t.getVariableServiceTemplate()})
                        }
                    } else {
                        serviceTemplates.push({name: expression.template, template:new Template(expression.template).getVariableServiceTemplate()})
                    }
                    break
                case 'winery': {
                    const winery = path.resolve(path.join(files.getWineryRepo(), 'servicetemplates', expression.template, 'ServiceTemplate.tosca'))
                    serviceTemplates.push({
                        name: expression.template,
                        template: yaml.load(fs.readFileSync(winery, 'utf-8')) as ServiceTemplate
                    })
                }
            }
        } catch (error) {
            console.error(`Could not locate service template ${expression.template} from source ${this.source}`)
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

    evaluateMatch(data: ServiceTemplate, expression: MatchExpression) {
        this.nodeGraph = new NodeGraph(data)
        let paths = new Set<string[]>()
        // initialize our starting nodes by checking the condition
        for (const n of this.filterNodes(data, expression.nodes[0])) {
            paths.add([n])
        }
        // for each path, expand all relationships at last node and check if it fits filters
        for (let i = 0; i < expression.relationships.length; i++) {
            paths = this.expand(data, paths, expression.relationships[i])
        }
        console.log('Found the following paths:')
        console.log(paths)
        const result: {[name: string]: string[]} = {}
        for (let i = 0; i < expression.nodes.length; i++) {
            const nodes = new Set<string>()
            for (const p of paths) {
                nodes.add(p[i])
            }
            result[expression.nodes[i].name] = [...nodes]
        }
        return result
    }

    expand(data: ServiceTemplate, paths: Set<string[]>, relationship: RelationshipExpression) {
        const newPaths = new Set<string[]>()
        for (const p of paths) {
            const node = p[p.length-1]
            if (this.nodeGraph.nodesMap[node]?.relationships) {
                for (const r of this.nodeGraph.nodesMap[node].relationships) {
                    if (!relationship.predicate || this.evaluatePredicate(r, relationship.predicate)) {
                        newPaths.add(p.concat(r.to))
                    }
                }
            }
        }
        return newPaths
    }

    /**
     * Gets a node expression as input and returns a string list of node template names that match
     * @param data
     * @param expression
     */
    filterNodes(data: ServiceTemplate, expression: NodeExpression) {
        let result: string[] = []
        const nodes = data.topology_template.node_templates
        if (expression.predicate) {
            for (const [key, value] of Object.entries(nodes)) {
                if (this.evaluatePredicate(value, expression.predicate)) {
                    result.push(key)
                }
            }
        } else {
            result = Object.keys(nodes)
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
        this.currentKeys = []
        for (const [key, value] of Object.entries(data)) {
            if (condition) {
                if (this.evaluatePredicate(value, condition))
                    result.push(value)
                    this.currentKeys.push(key)
            } else {
                result.push(value)
                this.currentKeys.push(key)
            }
        }
        return result
    }

    evaluateStep(data: Object, step: StepExpression) {
        if (Array.isArray(data)) {
            let result = []
            if (step.path == 'name') {
                result = this.currentKeys
            } else {
                for (const node of data) {
                    this.currentKeys = []
                    if (Object.getOwnPropertyDescriptor(node, step.path)) {
                        result.push(node[step.path])
                        this.currentKeys.push(step.path)
                    }
                }
            }
            return result
        } else {
            if (step.path == 'name') {
                return this.currentKeys[0]
            }
            this.currentKeys = [step.path]
            return (Object.getOwnPropertyDescriptor(data, step.path)) ? data[step.path] : null
        }
    }

    evaluateGroup(data: Object, name: string) {
        const groupNodes = data['topology_template']['groups']?.[name]?.['members']
        if (groupNodes == undefined) {
            throw new Error(`Could not find group ${name}`)
        }
        const result = {}
        this.currentKeys = groupNodes
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
        this.currentKeys = policyNodes
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
