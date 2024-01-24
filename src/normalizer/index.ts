import * as assert from '#assert'
import * as check from '#check'
import {PropertyContainerTemplate} from '#graph/property'
import {TypeContainerTemplate} from '#graph/type'
import {ArtifactDefinitionList, ArtifactDefinitionMap} from '#spec/artifact-definitions'
import {GroupTemplateMap} from '#spec/group-template'
import {NodeTemplate, NodeTemplateMap, TechnologyTemplate} from '#spec/node-template'
import {PropertyAssignmentList, PropertyAssignmentListEntry, PropertyAssignmentValue} from '#spec/property-assignments'
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
            const map: {[name: string]: T} = {}
            map[name] = template
            return map
        })
    }

    private normalizeProperties(template: PropertyContainerTemplate) {
        assert.isObject(template)
        if (check.isUndefined(template.properties)) return

        if (!check.isArray(template.properties)) {
            template.properties = Object.entries(template.properties).reduce<PropertyAssignmentList>(
                (list, [name, value]) => {
                    const map: PropertyAssignmentListEntry = {}
                    map[name] = {value}
                    list.push(map)
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
            ? [
                  (() => {
                      const map: {[name: string]: TypeAssignment} = {}
                      map[template.type] = {}
                      return map
                  })(),
              ]
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
                const map: ArtifactDefinitionMap = {}
                map[name] = definition
                list.push(map)
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

        // TODO: implement this
        if (check.isTrue(template.technology)) throw new Error(`Not supported yet`)

        if (check.isFalse(template.technology)) return delete template.technology

        if (check.isString(template.technology)) {
            const map: {[name: string]: TechnologyTemplate} = {}
            map[template.technology] = {}
            template.technology = [map]
        }

        if (check.isArray(template.technology)) {
            // Do nothing
        }

        if (!check.isArray(template.technology) && check.isObject(template.technology)) {
            template.technology = [template.technology]
        }

        assert.isDefined(template.technology)

        template.technology = template.technology.map(it => {
            const entry = utils.firstEntry(it)
            const map: {[name: string]: TechnologyTemplate} = {}
            map[entry[0].toLowerCase()] = entry[1]
            return map
        })
    }
}
