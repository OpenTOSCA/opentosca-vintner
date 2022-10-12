import {ServiceTemplate} from '../specification/service-template';
import {NodeTemplate, RequirementAssignmentMap} from '../specification/node-template';
import {PredicateExpression} from '../specification/query-type';
import {isString} from '../utils/validator';

type Node = {
    data: Object
    relationships: Relationship[]
}

type Relationship = {
    type: string
    to: string
}

export class Graph {
    nodesMap: {[name: string]: Node} = {}

    constructor(serviceTemplate: ServiceTemplate) {
        for (const [nodeName, nodeTemplate] of Object.entries(serviceTemplate.topology_template?.node_templates || {})) {
            this.nodesMap[nodeName] = {data: nodeTemplate, relationships: Graph.getRelationships(nodeTemplate)}
        }
    }

    private static getRelationships(nodeTemplate: NodeTemplate) {
        const relationships: Relationship[] = []
        if (nodeTemplate.requirements !== undefined) {
            for (const r of nodeTemplate.requirements) {
                relationships.push(this.resolveRelationship(r))
            }
        }
        return relationships;
    }

    private static resolveRelationship(r: RequirementAssignmentMap): {type: string, to: string} {
        if (isString(Object.values(r)[0])) {
            return {type: Object.keys(r)[0], to: Object.values(r)[0].toString()}
        } else {
            const target = (Object.values(r)[0])? '' : ''
            return {type: Object.keys(r)[0], to: Object.values(r)[0].toString()}
        }
    }

    private getNext(nodeName: string, predicate: PredicateExpression | undefined): string[] {
        const targets = new Set<string>()
        for (const r of this.nodesMap[nodeName]?.relationships || []) {
            targets.add(r.to)
        }
        return [...targets]
    }

    limitedBFS(nodeName: string, limit: number, predicate: PredicateExpression | undefined) {
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
            const next = this.getNext(current, predicate)
            if (next.length > 0) {
                for (const n of next) {
                    visited.add(n)
                    nodes.add(n)
                }
            }
        }
        return [...visited]
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
