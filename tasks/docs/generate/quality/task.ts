import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import Graph from '#graph/graph'
import * as puml from '#puml'
import {ArtifactTypeMap} from '#spec/artifact-type'
import {MANAGEMENT_INTERFACE} from '#spec/interface-definition'
import {NodeTemplate, NodeTemplateMap} from '#spec/node-template'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {TechnologyRule} from '#spec/technology-template'
import Registry from '#technologies/plugins/rules/registry'
import {METADATA} from '#technologies/plugins/rules/types'
import {Scenario} from '#technologies/types'
import {QUALITIES_FILENAME, QUALITY_LABEL, constructRuleName, toLabel} from '#technologies/utils'
import * as utils from '#utils'
import {UnexpectedError} from '#utils/error'
import path from 'path'
import process from 'process'
import descriptions from './technologies'

async function main() {
    /**
     * Directory
     */
    const dir = path.join('docs', 'docs', 'variability4tosca', 'quality')
    files.removeDirectory(dir)
    files.createDirectory(dir)

    /**
     * Rules
     */
    const rules = Registry.rules
    files.storeYAML<TechnologyRule[]>(path.join(dir, QUALITIES_FILENAME), rules)

    /**
     * Scenarios
     */
    const scenarios = Registry.scenarios

    /**
     * SVGs
     */
    const svgs: {[key: string]: string} = {}
    await Promise.all(
        scenarios.map(async scenario => {
            const template = generateTopology(scenario)
            const graph = new Graph(template)
            const svg = await puml.renderTopology(graph, {format: 'svg'})
            svgs[scenario.key] = svg
        })
    )

    /**
     * Groups
     */
    const groups = utils.groupBy(scenarios, it => it.component)

    /**
     * Documentation
     */
    await files.renderFile(
        path.join(__dirname, 'template.ejs'),
        {
            rules,
            svgs,
            groups,
            utils,
            toColor,
            toLabel,
            link: (type: string) => {
                if (type === '*') return type
                return `[${type}](${generateLink(type)}){target=_blank}`
            },
            constructRuleName,
            descriptions,
        },
        path.join(dir, 'index.md')
    )

    // Something keeps us hostage
    process.exit(0)
}

function toColor(weight: number) {
    const label = toLabel(weight)

    if (label === QUALITY_LABEL.VERY_HIGH) return 'success'
    if (label === QUALITY_LABEL.HIGH) return 'info'
    if (label === QUALITY_LABEL.MEDIUM) return 'question'
    if (label === QUALITY_LABEL.LOW) return 'warning'
    if (label === QUALITY_LABEL.VERY_LOW) return 'failure'

    throw new UnexpectedError()
}

function generateLink(type: string) {
    return `/normative#${type.replaceAll('.', '')}`
}

function generateTopology(scenario: Scenario) {
    assert.isDefined(scenario.hosting)

    const artifact_types: ArtifactTypeMap = {}
    const node_types: ArtifactTypeMap = {}
    const node_templates: NodeTemplateMap = {}

    /**
     * Component
     */
    const component: NodeTemplate = {
        type: scenario.component,
    }

    if (check.isDefined(scenario.operations) && utils.isPopulated(scenario.operations)) {
        component.interfaces = {
            [MANAGEMENT_INTERFACE]: {
                operations: scenario.operations.reduce<{[operation: string]: string}>((acc, cur) => {
                    acc[cur] = 'implementation'
                    return acc
                }, {}),
            },
        }
    }

    node_templates['component'] = component
    node_types[scenario.component] = {
        metadata: {
            [METADATA.VINTNER_LINK]: generateLink(scenario.component),
        },
    }

    /**
     * Artifact
     */
    if (check.isDefined(scenario.artifact)) {
        component.artifacts = {
            artifact: {
                type: scenario.artifact,
                file: 'dummy',
            },
        }

        artifact_types[scenario.artifact] = {
            derived_from: scenario.artifact,
            metadata: {
                [METADATA.VINTNER_LINK]: generateLink(scenario.artifact),
            },
        }
    }

    /**
     * Hosting
     */
    scenario.hosting.forEach((type, index) => {
        const name = 'host ' + (index + 1)

        node_templates[name] = {type}

        if (type !== '*') {
            node_types[type] = {
                metadata: {
                    [METADATA.VINTNER_LINK]: generateLink(type),
                },
            }
        }

        if (index === 0) {
            component.requirements = [{host: name}]
        } else {
            const previous = node_templates['host ' + index]
            assert.isDefined(previous)
            previous.requirements = [{host: name}]
        }
    })

    /**
     * Template
     */
    const template: ServiceTemplate = {
        tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
        artifact_types,
        node_types,
        topology_template: {
            node_templates,
        },
    }

    return template
}

main()
