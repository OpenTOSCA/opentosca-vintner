import * as assert from '#assert'
import * as check from '#check'
import {PropertyContainerTemplate} from '#graph/property'
import {TypeContainerTemplate} from '#graph/type'
import {ArtifactDefinitionList, ArtifactDefinitionMap} from '#spec/artifact-definitions'
import {GroupTemplateMap} from '#spec/group-template'
import {DeploymentTechnologyTemplate, NodeTemplate, NodeTemplateMap} from '#spec/node-template'
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
        this.extendImports()

        // Inputs
        this.extendInputs()

        // Nodes
        this.extendNodes()

        // Policies
        this.extendPolicies()

        // Groups
        this.extendGroups()

        // Relationship
        this.extendRelationships()
    }

    private extendInputs() {
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

    private extendProperties(template: PropertyContainerTemplate) {
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

    private extendRelationships() {
        Object.entries(this.serviceTemplate.topology_template?.relationship_templates || {}).forEach(it => {
            const template = it[1]
            this.extendTypes(template)
            this.extendProperties(template)
        })
    }

    private extendGroups() {
        if (check.isUndefined(this.serviceTemplate.topology_template?.groups)) return

        this.serviceTemplate.topology_template!.groups = this.getFromVariabilityPointMap(
            this.serviceTemplate.topology_template!.groups
        ).reduce<GroupTemplateMap[]>((list, map) => {
            const template = utils.firstValue(map)
            this.extendTypes(template)
            this.extendProperties(template)

            list.push(map)
            return list
        }, [])
    }

    private extendPolicies() {
        const policies = this.serviceTemplate.topology_template?.policies
        if (check.isUndefined(policies)) return
        assert.isArray(policies, 'Policies must be an array')
        policies.forEach(it => {
            const template = utils.firstValue(it)
            this.extendTypes(template)
            this.extendProperties(template)
        })
    }

    private extendTypes(template: TypeContainerTemplate) {
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

    private extendImports() {
        if (check.isUndefined(this.serviceTemplate.imports)) return
        this.serviceTemplate.imports = this.serviceTemplate.imports.map(it => (check.isString(it) ? {file: it} : it))
    }

    private extendNodes() {
        if (check.isUndefined(this.serviceTemplate.topology_template?.node_templates)) return

        this.serviceTemplate.topology_template!.node_templates = this.getFromVariabilityPointMap(
            this.serviceTemplate.topology_template!.node_templates
        ).reduce<NodeTemplateMap[]>((list, map) => {
            // Template
            const template = utils.firstValue(map)

            // Types
            this.extendTypes(template)

            // Properties
            this.extendProperties(template)

            // Relations
            this.extendRelations(template)

            // Artifacts
            this.extendArtifacts(template)

            // Technologies
            this.extendTechnologies(template)

            list.push(map)
            return list
        }, [])
    }

    private extendRelations(template: NodeTemplate) {
        if (check.isUndefined(template.requirements)) return
        for (const [index, map] of template.requirements.entries()) {
            const [relationName, assignment] = utils.firstEntry(map)
            map[relationName] = check.isString(assignment) ? {node: assignment} : assignment
        }
    }

    private extendArtifacts(template: NodeTemplate) {
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

        template.artifacts.forEach(it => this.extendArtifact(it))
    }

    private extendArtifact(map: ArtifactDefinitionMap) {
        const [name, template] = utils.firstEntry(map)
        if (check.isObject(template) && check.isUndefined(template.type)) template.type = 'tosca.artifacts.File'
        if (check.isString(template)) map[name] = {file: template, type: 'tosca.artifacts.File'}
        this.extendProperties(map[name])
    }

    private extendTechnologies(template: NodeTemplate) {
        if (check.isUndefined(template.technology)) return

        // TODO: implement this
        if (check.isTrue(template.technology)) throw new Error(`Not supported yet`)

        if (check.isFalse(template.technology)) return delete template.technology

        if (check.isString(template.technology)) {
            const map: {[name: string]: DeploymentTechnologyTemplate} = {}
            map[template.technology] = {}
            template.technology = map
            return
        }

        if (check.isArray(template.technology)) return

        if (check.isObject(template.technology)) {
            template.technology = [template.technology]
            return
        }

        throw new Error('Deployment technology template malformed')
    }
}
