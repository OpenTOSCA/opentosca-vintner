import * as assert from '#assert'
import * as check from '#check'
import {PropertyContainerTemplate} from '#graph/property'
import {TypeContainerTemplate} from '#graph/type'
import {ArtifactDefinitionList, ArtifactDefinitionMap} from '#spec/artifact-definitions'
import {GroupTemplateMap} from '#spec/group-template'
import {NodeTemplate, NodeTemplateMap} from '#spec/node-template'
import {PropertyAssignmentList, PropertyAssignmentValue} from '#spec/property-assignments'
import {ServiceTemplate} from '#spec/service-template'
import {InputDefinitionMap} from '#spec/topology-template'
import {TypeAssignment} from '#spec/type-assignment'
import {VariabilityPointList, VariabilityPointObject} from '#spec/variability'
import * as utils from '#utils'

export default class Normalizer {
    private readonly serviceTemplate: ServiceTemplate

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
    }

    run() {
        // Imports
        this.normalizeImports()

        // Inputs
        this.normalizeInputs()

        // Nodes
        this.normalizeNodes()

        // Policies
        this.normalizePolicies()

        // Groups
        this.normalizeGroups()

        // Relationship
        this.normalizeRelationships()

        // Technology rules
        this.normalizeTechnologyRules()
    }

    private normalizeInputs() {
        if (check.isUndefined(this.serviceTemplate.topology_template?.inputs)) return

        this.serviceTemplate.topology_template!.inputs = this.getFromVariabilityPointMap(
            this.serviceTemplate.topology_template!.inputs
        ).reduce<InputDefinitionMap[]>((list, map) => {
            list.push(map)
            return list
        }, [])
    }

    private getFromVariabilityPointMap<T>(data?: VariabilityPointObject<T>): {[name: string]: T}[] {
        if (check.isUndefined(data)) return []
        if (check.isArray(data)) return data
        return Object.entries(data).map(([name, template]) => {
            return {[name]: template}
        })
    }

    private normalizeProperties(template: PropertyContainerTemplate) {
        assert.isObject(template)
        if (check.isUndefined(template.properties)) return

        if (!check.isArray(template.properties)) {
            template.properties = Object.entries(template.properties).reduce<PropertyAssignmentList>(
                (list, [name, value]) => {
                    list.push({[name]: {value}})
                    return list
                },
                []
            )
        }

        template.properties.forEach(it => {
            const [propertyName, propertyAssignment] = utils.firstEntry(it)

            if (
                check.isString(propertyAssignment) ||
                check.isNumber(propertyAssignment) ||
                check.isBoolean(propertyAssignment) ||
                check.isArray(propertyAssignment) ||
                (check.isUndefined(propertyAssignment.value) && check.isUndefined(propertyAssignment.expression))
            ) {
                // This just works since we do not allow "value" as a keyword in a property assignment value
                const value = propertyAssignment as PropertyAssignmentValue
                it[propertyName] = {value}
            }
        })
    }

    private normalizeRelationships() {
        Object.entries(this.serviceTemplate.topology_template?.relationship_templates || {}).forEach(it => {
            const template = it[1]
            this.normalizeTypes(template)
            this.normalizeProperties(template)
        })
    }

    private normalizeGroups() {
        if (check.isUndefined(this.serviceTemplate.topology_template?.groups)) return

        this.serviceTemplate.topology_template!.groups = this.getFromVariabilityPointMap(
            this.serviceTemplate.topology_template!.groups
        ).reduce<GroupTemplateMap[]>((list, map) => {
            const template = utils.firstValue(map)
            this.normalizeTypes(template)
            this.normalizeProperties(template)

            list.push(map)
            return list
        }, [])
    }

    private normalizePolicies() {
        const policies = this.serviceTemplate.topology_template?.policies
        if (check.isUndefined(policies)) return
        assert.isArray(policies, 'Policies must be an array')
        policies.forEach(it => {
            const template = utils.firstValue(it)
            this.normalizeTypes(template)
            this.normalizeProperties(template)
        })
    }

    private normalizeTypes(template: TypeContainerTemplate) {
        assert.isDefined(template.type, `${utils.stringify(template)} has no type`)

        if (check.isArray(template.type)) return

        // Collect types
        const types: VariabilityPointList<TypeAssignment> = check.isString(template.type)
            ? [{[template.type]: {}}]
            : template.type

        template.type = types
    }

    private normalizeImports() {
        if (check.isUndefined(this.serviceTemplate.imports)) return
        this.serviceTemplate.imports = this.serviceTemplate.imports.map(it => (check.isString(it) ? {file: it} : it))
    }

    private normalizeNodes() {
        if (check.isUndefined(this.serviceTemplate.topology_template?.node_templates)) return

        this.serviceTemplate.topology_template!.node_templates = this.getFromVariabilityPointMap(
            this.serviceTemplate.topology_template!.node_templates
        ).reduce<NodeTemplateMap[]>((list, map) => {
            // Template
            const template = utils.firstValue(map)

            // Types
            this.normalizeTypes(template)

            // Properties
            this.normalizeProperties(template)

            // Relations
            this.normalizeRelations(template)

            // Artifacts
            this.normalizeArtifacts(template)

            // Technologies
            this.normalizeTechnologies(template)

            list.push(map)
            return list
        }, [])
    }

    private normalizeRelations(template: NodeTemplate) {
        if (check.isUndefined(template.requirements)) return
        for (const [index, map] of template.requirements.entries()) {
            const [relationName, assignment] = utils.firstEntry(map)
            map[relationName] = check.isString(assignment) ? {node: assignment} : assignment
        }
    }

    private normalizeArtifacts(template: NodeTemplate) {
        if (check.isUndefined(template.artifacts)) return

        if (!check.isArray(template.artifacts)) {
            const artifacts = Object.entries(template.artifacts)
            template.artifacts = artifacts.reduce<ArtifactDefinitionList>((list, [name, definition]) => {
                list.push({[name]: definition})
                return list
            }, [])
        }

        template.artifacts.forEach(it => this.normalizeArtifact(it))
    }

    private normalizeArtifact(map: ArtifactDefinitionMap) {
        const [name, template] = utils.firstEntry(map)
        if (check.isObject(template) && check.isUndefined(template.type)) template.type = 'tosca.artifacts.File'
        if (check.isString(template)) map[name] = {file: template, type: 'tosca.artifacts.File'}
        this.normalizeProperties(map[name])
    }

    private normalizeTechnologies(template: NodeTemplate) {
        if (check.isUndefined(template.technology)) return

        if (check.isString(template.technology)) {
            template.technology = [{[template.technology]: {}}]
        }

        if (check.isArray(template.technology)) {
            // Do nothing
        }

        assert.isArray(template.technology)

        template.technology = template.technology.map(it => {
            const entry = utils.firstEntry(it)
            return {[entry[0].toLowerCase()]: entry[1]}
        })
    }

    private normalizeTechnologyRules() {
        const map = this.serviceTemplate.topology_template?.variability?.technology_assignment_rules
        if (check.isUndefined(map)) return
        assert.isObject(map, 'Rules not loaded')

        for (const technology of Object.keys(map)) {
            const rules = map[technology]
            assert.isArray(rules)

            for (const rule of rules) {
                assert.isString(rule.component)

                if (check.isDefined(rule.host)) assert.isString(rule.host)
                if (check.isDefined(rule.conditions)) assert.isObject(rule.conditions)
                if (check.isDefined(rule.weight)) assert.isNumber(rule.weight)
                if (check.isDefined(rule.assign)) assert.isString(rule.assign)
            }
        }
    }
}
