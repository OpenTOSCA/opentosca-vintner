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

export class QueryResolver {
    // Abstract representation of the relationships between node templates. Used to evaluate MATCH clauses
    private nodeGraph: NodeGraph
    private source: string
    // Since YAML doesn't have the concept of a parent, we need to store the keys separately so we can query for object names
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
        return this.evaluate(tree)
    }

    /**
     * Function that takes an AST as input and returns the matching objects
     * @param expression The complete AST
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
                // Flatten the result if it is only one element
                result = (result.length == 1)? result[0] : result
                results.push({name: t.name, result: result})
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
        this.currentKeys = Object.keys(data.topology_template.node_templates)
        let paths = new Set<string[]>()
        // initialize our starting nodes by checking the condition
        for (const n of this.filterNodes(data, expression.nodes[0])) {
            paths.add([n])
        }
        // for each path, expand all relationships at last node and check if it fits filters
        for (let i = 0; i < expression.relationships.length; i++) {
            paths = this.expand(paths, expression.relationships[i], expression.nodes[i+1]?.predicate)
        }
        console.log('Found the following paths:')
        console.log(paths)
        /*
        Paths only contain node names as strings, so in this step we create a new array of nodes for each alias variable
        defined in the query, then put the matching nodes in that array
         */
        const result: {[name: string]: Object} = {}
        for (let i = 0; i < expression.nodes.length; i++) {
            const nodes = new Set<string>()
            for (const p of paths) nodes.add(p[i])
            result[expression.nodes[i].name] = this.getNodesByName(data, [...nodes])
        }
        return result
    }

    /**
     * Traverses all relationships of a given node to find neighbors
     * @param paths The current set of viable paths, expansion will start from the last node
     * @param relationship Direction and optional conditions of relationships
     * @param nodePredicate
     */
    expand(paths: Set<string[]>, relationship: RelationshipExpression, nodePredicate: PredicateExpression) {
        const newPaths = new Set<string[]>()
        for (const p of paths) {
            // do a breadth first search to find all nodes reachable within n steps
            const targets = this.nodeGraph.limitedBFS(p[p.length-1],relationship?.cardinality || 1, relationship.predicate)
            // if a predicate is specified, filter out nodes which do not satisfy it
            for (const n of targets) {
                if (!nodePredicate || this.evaluatePredicate(n, this.nodeGraph.nodesMap[n].data, nodePredicate)) {
                    newPaths.add(p.concat(n))
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
                if (this.evaluatePredicate(key, value, expression.predicate)) {
                    result.push(key)
                }
            }
        } else {
            result = Object.keys(nodes)
        }
        return result
    }

    evaluatePredicate(key: string, data: Object, predicate: PredicateExpression) {
        const {a, operator, b} = predicate
        if (operator == null) {
            return this.evaluateCondition(key, data, a as ConditionExpression)
        } else if (operator == 'AND') {
            return this.evaluatePredicate(key, data, a as PredicateExpression)
            && this.evaluatePredicate(key, data, b as PredicateExpression)
        } else if (operator == 'OR') {
            return this.evaluatePredicate(key, data, a as PredicateExpression)
                || this.evaluatePredicate(key, data, b as PredicateExpression)
        }
        return null
    }

    evaluateCondition(key: string, data: Object, condition: ConditionExpression) {
        if (condition.type == 'Existence') {
            return (Object.getOwnPropertyDescriptor(data, condition.variable)) ? data : null
        }
        if (condition.variable == 'name') {
            return (condition.value == key)? data : null
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
                if (this.evaluatePredicate(key, value, condition))
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

    /**
     * Returns a set of nodes that belong to a group
     * @param data The service template
     * @param name The name of the group
     */

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

    /**
     * Returns an array of nodes that are targeted by a policy
     * @param data The service template
     * @param name The name of the policy
     */

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

    getNodesByName(data: ServiceTemplate, names: string[]) {
        const result = {}
        for (const node of names){
            result[node] = data.topology_template.node_templates[node]
        }
        return result
    }

    resolvePath(path, obj) {
        return path.split('.').reduce(function(prev, curr) {
            return prev ? prev[curr] : null
        }, obj || self)
    }
}
