import * as assert from '#assert'
import * as check from '#check'
import Element from '#graph/element'
import Graph from '#graph/graph'
import {generatify} from '#graph/utils'
import {LogicExpression} from '#spec/variability'
import * as utils from '#utils'

export default class Enricher {
    private readonly graph: Graph

    private transformed = false

    constructor(graph: Graph) {
        this.graph = graph
    }

    run() {
        if (this.transformed) return
        this.transformed = true

        for (const element of this.graph.elements) this.enrichConditions(element)
    }

    enrichConditions(element: Element) {
        // Collect assigned conditions
        let conditions: LogicExpression[] = [...element.conditions]
        if (element.isNode() || element.isRelation()) {
            element.groups.filter(group => group.variability).forEach(group => conditions.push(...group.conditions))
        }
        conditions = utils.filterNotNull(conditions)

        // Add condition that checks if no other bratan is present
        // This condition is considered as manual condition
        if (element.defaultAlternative) {
            if (check.isUndefined(element.defaultAlternativeCondition))
                throw new Error(`${element.Display} has no default alternative condition`)
            conditions = [generatify(element.defaultAlternativeCondition)]
        }

        // Imply manual conditions if requested
        this.enrichConstraints(element, conditions)

        // Add default condition if requested
        if (element.pruningEnabled || (element.defaultEnabled && utils.isEmpty(conditions))) {
            conditions.unshift(generatify(element.defaultCondition))
        }

        // Store enriched conditions
        element.conditions = conditions
    }

    // TODO: element.implied
    // TODO: what is about bratan?
    // TODO: make this more beautiful: graph.addConstraint und transformer dann?
    private enrichConstraints(element: Element, conditions: LogicExpression[]) {
        if (utils.isEmpty(conditions)) return
        if (check.isUndefined(element.container)) return
        if (check.isUndefined(element.raw.implied)) return
        if (check.isFalse(element.raw.implied)) return
        assert.isDefined(this.graph.serviceTemplate.topology_template, 'Service template has no topology template')

        if (check.isUndefined(this.graph.serviceTemplate.topology_template.variability))
            this.graph.serviceTemplate.topology_template.variability = {inputs: {}}

        if (check.isUndefined(this.graph.serviceTemplate.topology_template.variability.constraints))
            this.graph.serviceTemplate.topology_template.variability.constraints = []

        // TODO: implement SOURCE, TARGET

        this.graph.serviceTemplate.topology_template.variability.constraints.push({
            implies: [{and: [element.container.id, element.manualId]}, element.id],
        })
    }
}
