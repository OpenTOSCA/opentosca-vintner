import {ServiceTemplate} from '../specification/service-template';
import {NodeTemplate} from '../specification/node-template';

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
}
