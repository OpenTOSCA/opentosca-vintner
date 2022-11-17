import {ServiceTemplate} from '#spec/service-template'
import {RequirementAssignmentMap} from '#spec/node-template'
import {PredicateExpression} from '#spec/query-type'
import {TopologyTemplate} from '#spec/topology-template'
import {firstKey, firstValue} from '#utils'
import {isString} from '#validator'
import {Resolver} from '#/query/resolver'
import {RelationshipTemplate} from '#spec/relationship-template'

type Node = {
    data: Object
    relationships: Relationship[]
}

type Relationship = {
    name: string
    source: string
    target: string
    template?: RelationshipTemplate
}

/**
 * Class that builds and searches a graph out of node templates and their relations
 * Used in resolving MATCH statements
 */

export class Graph {
    serviceTemplate: ServiceTemplate
    nodesMap: Map<string, Node> = new Map<string, Node>()
    resolver = new Resolver()

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
        for (const [nodeName, nodeTemplate] of Object.entries(
            serviceTemplate.topology_template?.node_templates || {}
        )) {
            this.nodesMap.set(nodeName, {
                data: nodeTemplate,
                relationships: [],
            })
        }
        this.getAllRelationships(serviceTemplate?.topology_template || {})
    }

    private getAllRelationships(topologyTemplate: TopologyTemplate) {
        for (const [nodeName, nodeTemplate] of Object.entries(topologyTemplate?.node_templates || {})) {
            if (nodeTemplate.requirements !== undefined) {
                for (const r of nodeTemplate.requirements) {
                    const relationship = this.resolveRelationship(nodeName, r)
                    this.nodesMap.get(nodeName)?.relationships.push(relationship)
                    this.nodesMap.get(relationship.target)?.relationships.push(relationship)
                }
            }
        }
    }

    private resolveRelationship(nodeName: string, r: RequirementAssignmentMap): Relationship {
        let target = Object.values(r)[0].toString()
        const name = Object.keys(r)[0]
        // value is not a string -> try extended notation, otherwise just set value as target node (short notation)
        if (!isString(firstValue(r))) {
            for (const entry of Object.values(r)) {
                if (!isString(entry) && firstKey(entry) == 'node') {
                    target = firstValue(entry).toString()
                }
            }
        }
        // Attach relationship template data if available
        return this.serviceTemplate.topology_template?.relationship_templates?.[name]
            ? {
                  name: Object.keys(r)[0],
                  source: nodeName,
                  target: target,
                  template: this.serviceTemplate.topology_template?.relationship_templates[name],
              }
            : {name: Object.keys(r)[0], source: nodeName, target: target}
    }

    /**
     * Returns a set of neighboring nodes for the given node, given that their relationship fulfills the predicate
     * and has the proper direction
     * @param nodeName Name of node from which to start the search
     * @param predicate Optional predicate that relationships need to fulfill
     * @param direction Whether to traverse inbound or outbound relationships, or both
     * @private
     */
    private getNext(nodeName: string, predicate: PredicateExpression | undefined, direction: string): string[] {
        const targets = new Set<string>()
        for (const r of this.nodesMap.get(nodeName)?.relationships || []) {
            if (!predicate || this.resolver.evaluatePredicate(r.name, r.template || {}, predicate)) {
                if ((direction == 'both' || direction == 'out') && r.source == nodeName) targets.add(r.target)
                if ((direction == 'both' || direction == 'in') && r.target == nodeName) targets.add(r.source)
            }
        }
        return [...targets]
    }

    limitedBFS(nodeName: string, minimum: number, maximum: number, direction: string, predicate?: PredicateExpression) {
        let level = 0
        const visited: Set<string> = new Set<string>()
        const nodes: Queue<any> = new Queue<string>()
        nodes.add(nodeName)
        nodes.add(null)
        while (!nodes.isEmpty() && level <= maximum - 1) {
            const current = nodes.pop()
            if (current == null) {
                level++
                nodes.add(null)
                if (nodes.peek() == null) break
            }
            const next = this.getNext(current, predicate, direction)
            if (next.length > 0) {
                for (const n of next) {
                    if (level >= minimum - 1) visited.add(n)
                    nodes.add(n)
                }
            }
        }
        return [...visited]
    }

    getNode(nodeName: string): Node | undefined {
        return this.nodesMap.get(nodeName)
    }
}

class Queue<T> {
    private items: T[] = []
    add(item: T) {
        this.items.push(item)
    }
    pop(): T | undefined {
        return this.items.shift()
    }
    peek(): T {
        return this.items[0]
    }
    isEmpty(): boolean {
        return this.items.length == 0
    }
}
