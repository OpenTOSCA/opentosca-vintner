import * as check from '#check'
import {ArtifactDefinitionList, ArtifactDefinitionMap} from '#spec/artifact-definitions'
import {NodeTemplate} from '#spec/node-template'
import {ServiceTemplate} from '#spec/service-template'
import {VariabilityPointMap} from '#spec/variability'
import * as utils from '#utils'

export default class Normalizer {
    private readonly serviceTemplate: ServiceTemplate

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
    }

    extend() {
        // Imports
        this.extendImports()

        // Nodes
        this.extendNodes()

        // TODO: extend types everywhere

        // TODO: extend properties everywhere
    }

    private getFromVariabilityPointMap<T>(data?: VariabilityPointMap<T>): {[name: string]: T}[] {
        if (check.isUndefined(data)) return []
        if (check.isArray(data)) return data
        return Object.entries(data).map(([name, template]) => {
            const map: {[name: string]: T} = {}
            map[name] = template
            return map
        })
    }

    private extendImports() {
        if (check.isUndefined(this.serviceTemplate.imports)) return
        this.serviceTemplate.imports = this.serviceTemplate.imports.map(it => (check.isString(it) ? {file: it} : it))
    }

    private extendNodes() {
        this.getFromVariabilityPointMap(this.serviceTemplate.topology_template?.node_templates).forEach(map => {
            const [nodeName, nodeTemplate] = utils.firstEntry(map)

            // TODO: extend types
            // TODO: extend properties

            // Relations
            this.extendRelations(nodeTemplate)

            // Artifacts
            this.extendArtifacts(nodeTemplate)
        })
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
            for (const [artifactName, artifactDefinition] of artifacts) {
                const map: ArtifactDefinitionMap = {}
                map[artifactName] = artifactDefinition
                this.extendArtifact(map)
            }

            template.artifacts = artifacts.reduce<ArtifactDefinitionList>((acc, [name, definition]) => {
                const map: ArtifactDefinitionMap = {}
                map[name] = definition
                acc.push(map)
                return acc
            }, [])
        }

        if (check.isArray(template.artifacts)) {
            template.artifacts.forEach(it => this.extendArtifact(it))
        }
    }

    private extendArtifact(map: ArtifactDefinitionMap) {
        const [artifactName, artifactDefinition] = utils.firstEntry(map)

        if (check.isObject(artifactDefinition) && check.isUndefined(artifactDefinition.type))
            artifactDefinition.type = 'tosca.artifacts.File'

        map[artifactName] = check.isString(artifactDefinition)
            ? {file: artifactDefinition, type: 'tosca.artifacts.File'}
            : artifactDefinition
    }
}
