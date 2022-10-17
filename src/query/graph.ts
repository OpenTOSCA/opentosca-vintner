import {ServiceTemplate} from '../specification/service-template';
import {RequirementAssignmentMap} from '../specification/node-template';
import {PredicateExpression} from '../specification/query-type';
import {TopologyTemplate} from '../specification/topology-template';
import {firstKey, firstValue} from '../utils/utils';
import {isString} from '../utils/validator';

type Node = {
    data: Object
    relationships: Relationship[]
}

type Relationship = {
    type: string
    source: string
    target: string
}

export class Graph {
    nodesMap: Map<string, Node> = new Map<string, Node>()

    constructor(serviceTemplate: ServiceTemplate) {
        for (const [nodeName, nodeTemplate] of Object.entries(serviceTemplate.topology_template?.node_templates || {})) {
            this.nodesMap.set(nodeName, {
                data: nodeTemplate,
                relationships: []
            })
        }
        this.getAllRelationships(serviceTemplate?.topology_template || {})
    }

    private getAllRelationships(topologyTemplate: TopologyTemplate) {
        for (const [nodeName, nodeTemplate] of Object.entries(topologyTemplate?.node_templates || {})) {
            if (nodeTemplate.requirements !== undefined) {
                for (const r of nodeTemplate.requirements) {
                    const relationship = Graph.resolveRelationship(nodeName, r)
                    this.nodesMap.get(nodeName)?.relationships.push(relationship)
                    this.nodesMap.get(relationship.target)?.relationships.push(relationship)
                }
            }
        }
    }

    private static resolveRelationship(nodeName: string, r: RequirementAssignmentMap): {type: string, source: string, target: string} {
        // value is not a string -> try extended notation, otherwise just set value as target node (short notation)
        if (!isString(firstValue(r))) {
            for (const entry of Object.values(r)) {
                if (!isString(entry) && firstKey(entry) == 'node') {
                    return {type: Object.keys(r)[0], source: nodeName, target: firstValue(entry).toString()}
                }
            }
        }
        return {type: Object.keys(r)[0], source: nodeName, target: Object.values(r)[0].toString()}
    }

    private getNext(nodeName: string, predicate: PredicateExpression | undefined, direction: string): string[] {
        const targets = new Set<string>()
        for (const r of this.nodesMap.get(nodeName)?.relationships || []) {
            if ((direction == 'both' || direction == 'right') && r.source == nodeName) {
                targets.add(r.target)
            } else if ((direction == 'both' || direction == 'left') && r.target == nodeName) {
                targets.add(r.source)
            }
        }
        return [...targets]
    }

    limitedBFS(nodeName: string, limit: number, predicate: PredicateExpression | undefined, direction: string) {
        let level = 0
        const visited: Set<string> = new Set<string>()
        const nodes: Queue<any> = new Queue<string>()
        nodes.add(nodeName)
        nodes.add(null)
        while (!nodes.isEmpty() && level < limit){
            const current = nodes.pop()
            if (current == null) {
                level++
                nodes.add(null)
                if(nodes.peek() == null) break
            }
            const next = this.getNext(current, predicate, direction)
            if (next.length > 0) {
                for (const n of next) {
                    visited.add(n)
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
    private items: T[] = [];
    add(item: T) {
        this.items.push(item);
    }
    pop(): T | undefined {
        return this.items.shift();
    }
    peek(): T {
        return this.items[0];
    }
    isEmpty():boolean {
        return this.items.length == 0;
    }
}
