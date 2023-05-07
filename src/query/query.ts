import {BfsGraph} from '#/query/bfs-graph'
import {getTemplates} from '#/query/utils'
import * as files from '#files'
import {NodeTemplate, NodeTemplateMap} from '#spec/node-template'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import * as validator from '#validator'
import {parse} from './parser'
import {
    ConditionExpression,
    Expression,
    FromExpression,
    MatchExpression,
    NodeExpression,
    PredicateExpression,
    RelationshipExpression,
    ReturnExpression,
    SelectExpression,
    VariableExpression,
} from './types'

export type QueryResults = {[name: string]: QueryResult}
export type QueryResult = Object

/**
 * This class resolves Queries4TOSCA expressions
 */
export class Query {
    // Abstract representation of the relationships between node templates. Used to evaluate MATCH clauses
    private graph: BfsGraph | undefined
    private currentTemplate: ServiceTemplate | undefined
    private source = ''
    // Since YAML doesn't have the concept of a parent, we need to store the keys separately so we can query for object names
    private currentKeys: string[] = []
    // The name of the node that contains the query (when resolving a query from within a template)
    private startingContext = ''

    /**
     * Resolves a query
     * @param options
     */
    async resolve(options: {query: string; source: string}) {
        this.source = options.source
        const query = files.isFile(options.query) ? files.loadFile(options.query) : options.query
        return this.evaluate(parse(query))
    }

    /**
     * Resolves a single query contained inside a template and returns the result value
     * @param query The query string
     * @param context The node that contains the query
     * @param template The template that contains the query
     */
    resolveFromTemplate(query: string, context: string, template: ServiceTemplate): Object {
        this.currentTemplate = template
        this.startingContext = context
        return this.evaluateSelect(template, parse(query, 'Select'))
    }

    /**
     * Function that takes an AST as input and returns the matching objects
     * @param expression The complete AST
     * @return result The data that matches the expression
     */
    private async evaluate(expression: Expression) {
        const results: QueryResults = {}
        const templates = await this.evaluateFrom(expression.from)

        for (const {template} of templates) {
            let result: any = template
            this.currentTemplate = template

            if (expression.match != null) result = this.evaluateMatch(result, expression.match)
            result = this.evaluateSelect(result, expression.select)
            if (result && !(Array.isArray(result) && result.length == 0)) {
                results[it.name] = result
            }
        }

        // TODO: return unwrapped results if only one result can be returned, e.g., when FROM is a single file

        const keys = Object.keys(results)
        return keys.length === 1 ? results[keys[0]] : results
    }

    /**
     * Loads the template or instance in the FROM clause
     */
    private async evaluateFrom(expression: FromExpression) {
        // TODO: Should support "FROM filePath" instead of "FROM template.filePath"
        return (await getTemplates(this.source, expression.type, expression.path)).filter(
            it => it.template.tosca_definitions_version === TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3
        )
    }

    /**
     * Evaluates a given select expression by going through each step of the path
     * @param data The data to run the expression against. This could be a ServiceTemplate,
     * or a NodeTemplateMap as a result of a MATCH statement
     * @param expression The SELECT expression to evaluate
     */
    private evaluateSelect(data: Object, expression: SelectExpression): Object {
        const results = []
        for (const p of expression.path) {
            let result = data
            for (const i of p.steps) {
                if (i.type == 'Group') {
                    result = this.evaluateGroup(result, i.path || '')
                } else if (i.type == 'Policy') {
                    result = this.evaluatePolicy(result, i.path || '')
                } else if (i.type == 'Condition' && i.condition) {
                    result = this.evaluateFilter(result, i.condition)
                } else if (i.type == 'Array') {
                    result = this.evaluateArrayAccess(result, i.index || 0)
                } else if (i.path == '*') {
                    this.currentKeys = Object.keys(result)
                    result = Object.values(result)
                } else if (i.path == 'SELF') {
                    if (validator.isArray(this.currentTemplate?.topology_template?.node_templates))
                        throw new Error(`Node templates must not be a list`)
                    result = this.currentTemplate?.topology_template?.node_templates?.[this.startingContext] || {}
                } else {
                    result = this.evaluateStep(result, i.path || '')
                }
            }
            if (p.returnVal) {
                result = this.evaluateReturn(result, p.returnVal)
            }
            results.push(result)
        }
        return results.length > 1 ? results : results[0]
    }

    /**
     * Evaluates a return structure against the query result
     * @param data The result data
     * @param returnVal The ReturnExpression that specifies key-value pairs to include
     */
    private evaluateReturn(data: Object, returnVal: ReturnExpression): Object {
        if (Array.isArray(data)) {
            const resultArray: any[] = []
            let i = 0
            for (const obj of data) {
                const entry: any = {}
                for (const pair of returnVal.keyValuePairs) {
                    entry[this.evaluateVariable(pair.key, obj, i)] = this.evaluateVariable(pair.value, obj, i)
                }
                i++
                resultArray.push(entry)
            }
            return resultArray
        } else {
            const result: any = {}
            for (const pair of returnVal.keyValuePairs) {
                result[this.evaluateVariable(pair.key, data)] = this.evaluateVariable(pair.value, data)
            }
            return result
        }
    }

    private evaluateVariable(variable: VariableExpression, result: any, index?: number): any {
        return variable.isString ? variable.text : this.resolvePath(variable.text, result, index || 0)
    }

    /**
     * Evaluates a MATCH statement and returns a map of variable names as keys and NodeTemplateMaps as values
     * @param data The template to run the MATCH query on
     * @param expression The MATCH expression
     * @private
     */
    private evaluateMatch(data: ServiceTemplate, expression: MatchExpression): {[name: string]: NodeTemplateMap} {
        this.graph = new BfsGraph(data)
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
        /*
        Paths only contain node names as strings, so in this step we create a new map of nodes for each alias variable
        defined in the query, then put the matching nodes in that array
         */
        const result: {[name: string]: NodeTemplateMap} = {}
        for (let i = 0; i < expression.nodes.length; i++) {
            const nodes = new Set<string>()
            for (const p of paths) nodes.add(p[i])
            const name = expression.nodes[i].name
            if (name) {
                result[name] = Query.getNodesByName(data, [...nodes])
            }
        }
        return result
    }

    /**
     * Traverses all relationships of a given node to find neighbors
     * @param paths The current set of viable paths, expansion will start from the last node
     * @param relationship Direction and optionally conditions of relationships
     * @param nodePredicate Optional predicate that next nodes need to fulfill
     */
    private expand(
        paths: Set<string[]>,
        relationship: RelationshipExpression,
        nodePredicate?: PredicateExpression
    ): Set<string[]> {
        const newPaths = new Set<string[]>()
        for (const p of paths) {
            // do a breadth first search to find all nodes reachable within n steps
            const targets = this.graph?.limitedBFS(
                p[p.length - 1],
                relationship?.cardinality?.min || 1,
                relationship?.cardinality?.max || 1,
                relationship.direction,
                relationship.predicate
            )
            // if a predicate is specified, filter out nodes which do not satisfy it
            for (const n of targets || []) {
                if (
                    !nodePredicate ||
                    (this.graph?.getNode(n)?.raw &&
                        this.evaluatePredicate(n, this.graph?.getNode(n)?.raw || {}, nodePredicate))
                ) {
                    newPaths.add(p.concat(n))
                }
            }
        }
        return newPaths
    }

    /**
     * Gets a node expression as input and returns a string list of node template names that match
     */
    private filterNodes(data: ServiceTemplate, expression: NodeExpression): string[] {
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

    evaluatePredicate(key: string, data: Object, predicate: PredicateExpression): boolean {
        const {a, operator, b} = predicate
        if (operator == null) {
            return this.evaluateCondition(key, data, a as ConditionExpression)
        } else if (operator == 'AND') {
            return (
                this.evaluatePredicate(key, data, a as PredicateExpression) &&
                this.evaluatePredicate(key, data, b as PredicateExpression)
            )
        } else if (operator == 'OR') {
            return (
                this.evaluatePredicate(key, data, a as PredicateExpression) ||
                this.evaluatePredicate(key, data, b as PredicateExpression)
            )
        }
        return false
    }

    /**
     * Evaluates a condition against the given data, returns true if condition applies, otherwise returns false
     * @param key The key of the current object, to check for its name
     * @param data The data to evaluate the condition on
     * @param condition The condition to check against the data
     */
    private evaluateCondition(key: string, data: Object, condition: ConditionExpression): boolean {
        const {variable, value, operator} = condition
        if (condition.type == 'Existence') {
            const exists = this.resolvePath(variable, data) != null
            return condition.negation ? !exists : exists
        }
        if (condition.variable == 'name') {
            if (condition.operator == '=') {
                return condition.negation ? condition.value != key : condition.value == key
            } else {
                if (value) return condition.negation ? !new RegExp(value).test(key) : new RegExp(value).test(key)
            }
        }
        const property = this.resolvePath(variable, data)
        let result = false
        if (value) {
            switch (operator) {
                case '=':
                    result = property == value
                    break
                case '!=':
                    result = property !== value
                    break
                case '>=':
                    result = property >= value
                    break
                case '>':
                    result = property > value
                    break
                case '<=':
                    result = property <= value
                    break
                case '<':
                    result = property < value
                    break
                case '=~':
                    result = new RegExp(value).test(property)
                    break
            }
        }
        return condition.negation ? !result : result
    }

    /**
     * Returns an array containing all children of the given data
     * @param data Data for which all children should be returned
     * @param condition Optional condition that all elements in the result set need to fulfill
     */
    private evaluateFilter(data: Object, condition: PredicateExpression): Object {
        if (Array.isArray(data)) {
            const result: Object[] = []
            const keys = this.currentKeys
            this.currentKeys = []
            for (let i = 0; i < data.length; i++) {
                if (this.evaluatePredicate(keys[i], data[i], condition)) {
                    result.push(data[i])
                    this.currentKeys.push(keys[i])
                }
            }
            return result.length > 1 ? result : result[0]
        } else {
            return this.evaluatePredicate(this.currentKeys[0], data, condition)
        }
    }

    private evaluateStep(data: Object, path: string): Object {
        if (Array.isArray(data)) {
            let result = []
            if (path == 'name') {
                result = this.currentKeys
            } else {
                for (const node of data) {
                    this.currentKeys = []
                    if (Object.getOwnPropertyDescriptor(node, path)) {
                        result.push(node[path])
                        this.currentKeys.push(path)
                    }
                }
            }
            return result.length > 1 ? result : result[0]
        } else {
            if (path == 'name') {
                return this.currentKeys[0]
            } else if (path == 'relationship') {
                const name = this.resolvePath(path, data)
                this.currentKeys = [name]
                return this.currentTemplate?.topology_template?.relationship_templates?.[name] || {}
            }
            this.currentKeys = [path]
            return this.resolvePath(path, data)
        }
    }

    private evaluateArrayAccess(data: Object, index: number): Object {
        if (Array.isArray(data)) {
            this.currentKeys = [this.currentKeys[index]] || ''
            return data[index] || {}
        } else {
            return index == 0 ? data : {}
        }
    }

    /**
     * Returns a set of nodes that belong to a group
     * @param data The service template
     * @param name The name of the group
     */
    private evaluateGroup(data: any, name: string): NodeTemplateMap {
        const groupNodesNames = data['topology_template']['groups']?.[name]?.['members']
        if (groupNodesNames == undefined) {
            throw new Error(`Could not find group ${name}`)
        }
        const result: NodeTemplateMap = {}
        this.currentKeys = groupNodesNames
        for (const i of groupNodesNames) {
            result[i] = data['topology_template']['node_templates'][i]
        }
        return result
    }

    /**
     * Returns an array of nodes that are targeted by a policy
     * @param data The service template
     * @param name The name of the policy
     */
    private evaluatePolicy(data: any, name: string): NodeTemplateMap {
        const policyNodeNames = data['topology_template']['policies']?.[0]?.[name]?.['targets']
        if (policyNodeNames == undefined) {
            throw new Error(`Could not find policy ${name}`)
        }
        const result: any = {}
        this.currentKeys = policyNodeNames
        for (const i of policyNodeNames) {
            result[i] = data['topology_template']['node_templates'][i]
        }
        return result
    }

    /**
     * Receives a list of node names and returns a map with their names and their data
     * @param template Template containing the nodes
     * @param names Names of all nodes that should be included in the result set
     */
    private static getNodesByName(template: ServiceTemplate, names: string[]): {[name: string]: NodeTemplate} {
        if (validator.isArray(template.topology_template?.node_templates))
            throw new Error(`Node templates must not be a list`)

        const result: {[name: string]: NodeTemplate} = {}
        for (const node of names) {
            if (template.topology_template?.node_templates?.[node])
                result[node] = template.topology_template?.node_templates?.[node]
        }
        return result
    }

    /**
     * Resolves a given path against the input data. Elements of the path need to be separated by dots
     * @param path The path to resolve
     * @param obj The object to resolve the path against
     * @param index The index of the object if the current result is an array. Used to access its name
     */
    private resolvePath(path: string, obj: any, index?: number): any {
        if (path == 'name' && index != undefined) return this.currentKeys[index]
        return path.split('.').reduce(function (prev, curr) {
            return prev ? prev[curr] : null
        }, obj)
    }
}
