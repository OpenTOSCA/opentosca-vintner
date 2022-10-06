import {Parser} from './parser';
import {Template, Templates} from '../repository/templates';
import {Instance} from '../repository/instances';
import {
    ConditionExpression, Expression, FromExpression, MatchExpression, NodeExpression, PredicateExpression,
    RelationshipExpression, SelectExpression, StepExpression
} from '../specification/query-type';
import {ServiceTemplate} from '../specification/service-template';
import {Graph} from './graph';
import {QueryTemplateArguments} from '../controller/query/query';
import * as files from '../utils/files'
import path from 'path';

export class Resolver {
    // Abstract representation of the relationships between node templates. Used to evaluate MATCH clauses
    private nodeGraph: Graph | undefined
    private source = ''
    // Since YAML doesn't have the concept of a parent, we need to store the keys separately so we can query for object names
    private currentKeys: string[] = [];

    resolve(query: QueryTemplateArguments) {
        const parser = new Parser
        let tree
        try {
            this.source = query.source
            tree = parser.getAST(query.query)
        } catch (e: any) {
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
    private evaluate(expression: Expression) {
        const results = []
        const templates = this.evaluateFrom(expression.from)
        for (const t of templates) {
            let result: any = t.template
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
    private evaluateFrom(expression: FromExpression) {
        const serviceTemplates = []
        try {
            switch(this.source) {
                case 'vintner':
                    if (expression.type == 'Instance') {
                        serviceTemplates.push({
                            name: expression.instance,
                            template: new Instance(expression.instance || '').getTemplateWithAttributes()
                        })
                    } else if (expression.type == 'Template' && expression.template == '*') {
                        for (const t of Templates.all()) {
                            serviceTemplates.push({name: t.getName(), template: t.getVariableServiceTemplate()})
                        }
                    } else {
                        serviceTemplates.push({name: expression.template, template:new Template(expression.template || '').getVariableServiceTemplate()})
                    }
                    break
                case 'winery': {
                    const winery = path.resolve(path.join(files.getWineryRepo(), 'servicetemplates', (expression.template || ''), 'ServiceTemplate.tosca'))
                    serviceTemplates.push({
                        name: expression.template,
                        template: files.loadFile(winery) as ServiceTemplate
                    })
                }
            }
        } catch (e: unknown) {
            console.error(`Could not locate service template ${expression.template} from source ${this.source}`)
            if (e instanceof Error) {
                console.error(e.message)
            }
        }
        return serviceTemplates
    }

    private evaluateSelect(data: Object, expression: SelectExpression) {
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

    private evaluateMatch(data: ServiceTemplate, expression: MatchExpression) {
        this.nodeGraph = new Graph(data)
        this.currentKeys = Object.keys(data.topology_template?.node_templates || [])
        let paths = new Set<string[]>()
        // initialize our starting nodes by checking the condition
        for (const n of this.filterNodes(data, expression.nodes[0])) {
            paths.add([n])
        }
        // for each path, expand all relationships at last node and check if it fits filters
        if (expression.relationships) {
            for (let i = 0; i < expression.relationships.length; i++) {
                paths = this.expand(paths, expression.relationships[i], expression.nodes[i + 1]?.predicate)
            }
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
            const name = expression.nodes[i].name
            if (name) {
                result[name] = Resolver.getNodesByName(data, [...nodes])
            }
        }
        console.log(result)
        return result
    }

    /**
     * Traverses all relationships of a given node to find neighbors
     * @param paths The current set of viable paths, expansion will start from the last node
     * @param relationship Direction and optional conditions of relationships
     * @param nodePredicate
     */
    private expand(paths: Set<string[]>, relationship: RelationshipExpression, nodePredicate: PredicateExpression | undefined) {
        const newPaths = new Set<string[]>()
        for (const p of paths) {
            // do a breadth first search to find all nodes reachable within n steps
            const targets = this.nodeGraph?.limitedBFS(p[p.length-1],relationship?.cardinality || 1, relationship.predicate)
            // if a predicate is specified, filter out nodes which do not satisfy it
            for (const n of targets || []) {
                if (!nodePredicate || (this.nodeGraph?.nodesMap[n].data && this.evaluatePredicate(n, this.nodeGraph.nodesMap[n].data, nodePredicate))) {
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
    private filterNodes(data: ServiceTemplate, expression: NodeExpression) {
        let result: string[] = []
        const nodes = data.topology_template?.node_templates || {}
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

    private evaluatePredicate(key: string, data: Object, predicate: PredicateExpression): Object {
        const {a, operator, b} = predicate
        if (operator == null) {
            return Resolver.evaluateCondition(key, data, a as ConditionExpression)
        } else if (operator == 'AND') {
            return this.evaluatePredicate(key, data, a as PredicateExpression)
            && this.evaluatePredicate(key, data, b as PredicateExpression)
        } else if (operator == 'OR') {
            return this.evaluatePredicate(key, data, a as PredicateExpression)
                || this.evaluatePredicate(key, data, b as PredicateExpression)
        }
        return {}
    }

    private static evaluateCondition(key: string, data: Object, condition: ConditionExpression): Object {
        if (condition.type == 'Existence') {
            return (Object.getOwnPropertyDescriptor(data, condition.variable)) ? data : {}
        }
        if (condition.variable == 'name') {
            return (condition.value == key)? data : {}
        }
        const {variable, value, operator} = condition
        const property = Resolver.resolvePath(variable, data)
        if (value) {
            switch(operator) {
               case '=':
                   return ((property == value)? data : {})
               case '!=':
                   return ((property !== value)? data : {})
              case '>=':
                   return ((property >= value)? data : {})
              case '>':
                  return ((property > value)? data : {})
               case '<=':
                  return ((property <= value)? data : {})
              case '<':
                   return ((property < value)? data : {})
            }
        }
        return {}
    }

    private evaluateWildcard(data: Object, condition?: PredicateExpression) {
        const result: any = {}
        this.currentKeys = []
        for (const [key, value] of Object.entries(data)) {
            if (condition) {
                if (this.evaluatePredicate(key, value, condition))
                    result[key] = value
                    this.currentKeys.push(key)
            } else {
                result[key] = value
                this.currentKeys.push(key)
            }
        }
        return result
    }

    private evaluateStep(data: any, step: StepExpression): Object {
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
            return (Object.getOwnPropertyDescriptor(data, step.path)) ? data[step.path] : {}
        }
    }

    /**
     * Returns a set of nodes that belong to a group
     * @param data The service template
     * @param name The name of the group
     */

    private evaluateGroup(data: any, name: string): any {
        const groupNodes = data['topology_template']['groups']?.[name]?.['members']
        if (groupNodes == undefined) {
            throw new Error(`Could not find group ${name}`)
        }
        const result: any = {}
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

    private evaluatePolicy(data: any, name: string): any {
        const policyNodes = data['topology_template']['policies']?.[0]?.[name]?.['targets']
        if (policyNodes == undefined) {
            throw new Error(`Could not find policy ${name}`)
        }
        const result: any = {}
        this.currentKeys = policyNodes
        for (const i of policyNodes) {
            result[i] = data['topology_template']['node_templates'][i]
        }
        return result;
    }

    private static getNodesByName(data: ServiceTemplate, names: string[]) {
        const result: any = {}
        for (const node of names){
            result[node] = data.topology_template?.node_templates?.[node] || undefined
        }
        return result
    }

    private static resolvePath(path: string, obj: any): any {
        return path.split('.').reduce(function(prev, curr) {
            return prev ? prev[curr] : null
        }, obj)
    }
}
