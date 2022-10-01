import {ServiceTemplate} from '../specification/service-template';
import {NodeTemplate} from '../specification/node-template';
import {PredicateExpression} from '../specification/query-type';

type Node = {
    data: Object
    relationships: Relationship[]
}

type Relationship = {
    type: string
    to: string
}

export class NodeGraph {
    nodesMap: {[name: string]: Node} = {}

    constructor(serviceTemplate: ServiceTemplate) {
        for (const [nodeName, nodeTemplate] of Object.entries(serviceTemplate.topology_template?.node_templates)) {
            this.nodesMap[nodeName] = {data: nodeTemplate, relationships: NodeGraph.getRelationships(nodeTemplate)}
        }
    }

    private static getRelationships(nodeTemplate: NodeTemplate) {
        const relationships: Relationship[] = []
        if (nodeTemplate.requirements !== undefined) {
            for (const r of nodeTemplate.requirements) {
                relationships.push({type: Object.keys(r)[0], to: Object.values(r)[0].toString()})
            }
        }
        return relationships;
    }

    getAllTargets(nodeNames: string[]) {
        const targets = new Set<string>()
        for (const name of nodeNames) {
            for (const r of this.nodesMap[name].relationships) {
                targets.add(r.to)
            }
        }
        return [...targets]
    }

    getNodesByName(nodeNames: string[]) {
        const result: {[name: string]: Node} = {}
        for (const name of nodeNames) {
            result[name] = this.nodesMap[name]
        }
        return result
    }

    getNext(nodeName: string, predicate: PredicateExpression): string[] {
        const targets = new Set<string>()
        for (const r of this.nodesMap[nodeName]?.relationships || []) {
            targets.add(r.to)
        }
        return [...targets]
    }

    limitedBFS(nodeName: string, limit: number, predicate: PredicateExpression) {
        let level = 0
        const visited: Set<string> = new Set<string>()
        const nodes: Queue<string> = new Queue<string>()
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
    pop(): T {
        return this.items.shift();
    }
    peek(): T {
        return this.items[0];
    }
    isEmpty():boolean {
        return this.items.length == 0;
    }
}
