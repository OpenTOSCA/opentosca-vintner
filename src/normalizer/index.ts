import * as assert from '#assert'
import * as check from '#check'
import {NormalizationOptions} from '#graph/options'
import {PropertyContainerTemplate} from '#graph/property'
import {TypeContainerTemplate} from '#graph/type'
import {
    ARTIFACT_DEFINITION_DEFAULT_TYPE,
    ArtifactDefinitionList,
    ArtifactDefinitionMap,
    ExtendedArtifactDefinition,
} from '#spec/artifact-definitions'
import {ARTIFACT_TYPE_ROOT} from '#spec/artifact-type'
import {CAPABILITY_TYPE_ROOT} from '#spec/capability-type'
import {DATA_TYPE_ROOT} from '#spec/data-type'
import {GroupTemplateMap} from '#spec/group-template'
import {GROUP_TYPE_ROOT} from '#spec/group-type'
import {INTERFACE_TYPE_ROOT} from '#spec/interface-type'
import {
    ExtendedRequirementAssignment,
    NodeTemplate,
    NodeTemplateMap,
    RequirementAssignmentList,
} from '#spec/node-template'
import {NODE_TYPE_ROOT} from '#spec/node-type'
import {POLICY_TYPE_ROOT} from '#spec/policy-type'
import {PropertyAssignmentList, PropertyAssignmentValue} from '#spec/property-assignments'
import {RELATIONSHIP_TYPE_ROOT} from '#spec/relationship-type'
import {ServiceTemplate} from '#spec/service-template'
import {InputDefinitionMap, OutputDefinitionMap} from '#spec/topology-template'
import {TypeAssignment} from '#spec/type-assignment'
import {VariabilityAlternative, VariabilityPointList, VariabilityPointObject} from '#spec/variability'
import {QUALITY_DEFAULT_WEIGHT, constructImplementationName} from '#technologies/utils'
import * as utils from '#utils'

export default class Normalizer {
    private readonly serviceTemplate: ServiceTemplate
    private readonly options: NormalizationOptions

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
        this.options = new NormalizationOptions(serviceTemplate)
    }

    run() {
        // Imports
        this.normalizeImports()

        // Inputs
        this.normalizeInputs()

        // Nodes
        this.normalizeNodes()

        // Outputs
        this.normalizeOutputs()

        // Policies
        this.normalizePolicies()

        // Groups
        this.normalizeGroups()

        // Relationship
        this.normalizeRelationships()

        // Technology rules
        this.normalizeTechnologyRules()

        // Types
        this.normalizeArtifactTypes()
        this.normalizeCapabilityTypes()
        this.normalizeDataTypes()
        this.normalizeGroupTypes()
        this.normalizeInterfaceTypes()
        this.normalizeNodeTypes()
        this.normalizePolicyTypes()
        this.normalizeRelationshipTypes()

        // Clean variability definition
        this.cleanVariabilityDefinition()
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

    private normalizeOutputs() {
        if (check.isUndefined(this.serviceTemplate.topology_template?.outputs)) return

        // Normalize
        const outputs = this.getFromVariabilityPointMap(this.serviceTemplate.topology_template!.outputs).reduce<
            OutputDefinitionMap[]
        >((list, map) => {
            list.push(map)
            return list
        }, [])

        // Automatic default alternative
        if (this.options.automaticDefaultAlternatives) {
            const scopes = utils.groupBy(outputs, utils.firstKey)
            Object.values(scopes).forEach(group => this.automaticDefault(group.map(utils.firstValue)))
        }

        this.serviceTemplate.topology_template!.outputs = outputs
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

        // Automatic default alternative
        if (this.options.automaticDefaultAlternatives) {
            const scopes = utils.groupBy(template.properties, utils.firstKey)
            Object.values(scopes).forEach(scope => this.automaticDefault(scope.map(utils.firstValue)))
        }
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
        assert.isDefined(template.type)

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

        // Automatic default alternative
        if (this.options.automaticDefaultAlternatives) {
            const scopes = utils.groupBy(template.requirements as RequirementAssignmentList, utils.firstKey)
            Object.values(scopes).forEach(scope =>
                this.automaticDefault(scope.map(utils.firstValue) as ExtendedRequirementAssignment[])
            )
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

        // Automatic default alternative
        if (this.options.automaticDefaultAlternatives) {
            const scopes = utils.groupBy(template.artifacts as ArtifactDefinitionList, utils.firstKey)
            Object.values(scopes).forEach(scope =>
                this.automaticDefault(scope.map(utils.firstValue) as ExtendedArtifactDefinition[])
            )
        }
    }

    private normalizeArtifact(map: ArtifactDefinitionMap) {
        const [name, template] = utils.firstEntry(map)

        if (check.isObject(template) && check.isUndefined(template.type)) {
            template.type = ARTIFACT_DEFINITION_DEFAULT_TYPE
        }

        if (check.isString(template)) {
            map[name] = {file: template, type: ARTIFACT_DEFINITION_DEFAULT_TYPE}
        }

        const updated = map[name]
        assert.isObject(updated)

        this.normalizeProperties(updated)
        this.normalizeTypes(updated)
    }

    /**
     * Transform technologies to array of extended notation
     */
    private normalizeTechnologies(template: NodeTemplate) {
        // Assign empty array if undefined
        if (check.isUndefined(template.technology)) template.technology = []

        // Technology is directly assigned but in its short notation
        if (check.isString(template.technology)) {
            template.technology = [{[template.technology]: {}}]
        }

        // None, one, or multiple technologies are assigned but already as array
        if (check.isArray(template.technology)) {
            // Do nothing
        }

        // Sanity check
        assert.isArray(template.technology)

        // Lowercase technology names
        template.technology = template.technology.map(it => {
            const [name, definition] = utils.firstEntry(it)
            return {[name.toLowerCase()]: definition}
        })

        // Default assign is "${node_type}~${node_type}::${technology}"
        template.technology.forEach(map => {
            const [technologyName, technologyTemplate] = utils.firstEntry(map)

            assert.isArray(template.type)
            const type = utils.firstKey(utils.first(template.type))

            technologyTemplate.assign =
                technologyTemplate.assign ??
                constructImplementationName({
                    type,
                    rule: {component: type, technology: technologyName},
                })
        })

        // Automatic default alternative
        if (this.options.automaticDefaultAlternatives) {
            this.automaticDefault(template.technology.map(utils.firstValue))
        }
    }

    private normalizeTechnologyRules() {
        const rules = this.serviceTemplate.topology_template?.variability?.qualities
        if (check.isUndefined(rules)) return
        assert.isObject(rules, 'Rules not loaded')

        for (const rule of rules) {
            assert.isString(rule.component)

            rule.weight = rule.weight ?? QUALITY_DEFAULT_WEIGHT

            if (check.isUndefined(rule.hosting)) rule.hosting = []
            assert.isArray(rule.hosting)
            rule.hosting.forEach(it => assert.isString(it))

            if (check.isDefined(rule.conditions)) assert.isObject(rule.conditions)
            if (check.isDefined(rule.weight)) assert.isNumber(rule.weight)
            if (check.isDefined(rule.assign)) assert.isString(rule.assign)
        }
    }

    private normalizeArtifactTypes() {
        for (const [name, type] of Object.entries(this.serviceTemplate.artifact_types ?? {})) {
            if (check.isUndefined(type.derived_from)) type.derived_from = ARTIFACT_TYPE_ROOT
        }
    }

    private normalizeCapabilityTypes() {
        for (const [name, type] of Object.entries(this.serviceTemplate.capability_types ?? {})) {
            if (check.isUndefined(type.derived_from)) type.derived_from = CAPABILITY_TYPE_ROOT
        }
    }

    private normalizeDataTypes() {
        for (const [name, type] of Object.entries(this.serviceTemplate.data_types ?? {})) {
            if (check.isUndefined(type.derived_from)) type.derived_from = DATA_TYPE_ROOT
        }
    }

    private normalizeGroupTypes() {
        for (const [name, type] of Object.entries(this.serviceTemplate.group_types ?? {})) {
            if (check.isUndefined(type.derived_from)) type.derived_from = GROUP_TYPE_ROOT
        }
    }

    private normalizeInterfaceTypes() {
        for (const [name, type] of Object.entries(this.serviceTemplate.interface_types ?? {})) {
            if (check.isUndefined(type.derived_from)) type.derived_from = INTERFACE_TYPE_ROOT
        }
    }

    private normalizeNodeTypes() {
        for (const [name, type] of Object.entries(this.serviceTemplate.node_types ?? {})) {
            if (check.isUndefined(type.derived_from)) type.derived_from = NODE_TYPE_ROOT
        }
    }

    private normalizePolicyTypes() {
        for (const [name, type] of Object.entries(this.serviceTemplate.policy_types ?? {})) {
            if (check.isUndefined(type.derived_from)) type.derived_from = POLICY_TYPE_ROOT
        }
    }

    private normalizeRelationshipTypes() {
        for (const [name, type] of Object.entries(this.serviceTemplate.relationship_types ?? {})) {
            if (check.isUndefined(type.derived_from)) type.derived_from = RELATIONSHIP_TYPE_ROOT
        }
    }

    private automaticDefault(templates: VariabilityAlternative[]) {
        if (templates.length === 1) return

        const already = templates.filter(ot => check.isTrue(ot.default_alternative))
        if (utils.isPopulated(already)) return

        const candidates = templates.filter(ot => {
            if (check.isDefined(ot.conditions)) return false
            if (check.isDefined(ot.default_alternative)) return false
            return true
        })
        if (candidates.length !== 1) return

        const candidate = utils.first(candidates)
        candidate.default_alternative = true
    }

    private cleanVariabilityDefinition() {
        const topology = this.serviceTemplate.topology_template

        if (check.isUndefined(topology)) return
        if (check.isUndefined(topology.variability)) return

        // Delete normalization options
        if (check.isDefined(topology.variability.options)) {
            delete topology.variability.options.technology_required
        }

        // Remove empty options
        if (utils.isEmpty(topology.variability.options)) delete topology.variability.options

        // Remove empty variability
        if (utils.isEmpty(topology.variability)) delete topology.variability
    }
}
