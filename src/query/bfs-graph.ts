import {PredicateExpression} from '#spec/query-type'
import {Query} from '#/query/query'
import Graph from '#/resolver/graph'
import {isUndefined} from '#validator'

/**
 * Class that builds and searches a graph out of node templates and their relations
 * Used in resolving MATCH statements
 */
export class BfsGraph extends Graph {
    private readonly resolver = new Query()

    /**
     * Returns a set of neighboring nodes for the given node, given that their relationship fulfills the predicate
     * and has the proper direction
     * @param nodeName Name of node from which to start the search
     * @param predicate Optional predicate that relationships need to fulfill
     * @param direction Whether to traverse inbound or outbound relationships, or both
     * @private
     */
    private getNext(nodeName: string, predicate: PredicateExpression | undefined, direction: string): string[] {
        const targets: string[] = []
        const node = this.nodesMap.get(nodeName)
        if (isUndefined(node)) return targets

        for (const relation of node.relations) {
            if (
                !predicate ||
                this.resolver.evaluatePredicate(relation.name, relation.relationship?._raw || {}, predicate)
            ) {
                if ((direction == 'both' || direction == 'out') && relation.source == nodeName)
                    targets.push(relation.target)
                if ((direction == 'both' || direction == 'in') && relation.target == nodeName)
                    targets.push(relation.source)
            }
        }

        return targets
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
