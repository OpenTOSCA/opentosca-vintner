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
import {QUALITIES_FILENAME, QUALITY_LABEL, constructRuleName, constructScenarioName, toLabel} from '#technologies/utils'
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
     * SVGs
     */
    const svgs: {[key: string]: string} = {}
    const promises = []
    for (const [index, rule] of rules.entries()) {
        const id = 'rule.' + rule.technology + '.' + (index + 1)
        const template = generateTopology(rule)
        const graph = new Graph(template)
        const promise = puml.renderTopology(graph, {format: 'svg'}).then(svg => {
            svgs[id] = svg
        })
        promises.push(promise)
    }
    await Promise.all(promises)

    /**
     * Scenarios
     */
    const scenarios: TechnologyRuleScenario[] = []
    for (const [index, rule] of rules.entries()) {
        assert.isDefined(rule.weight)
        //assert.isDefined(rule.details)
        assert.isDefined(rule.hosting)

        const description = descriptions.find(it => it.id === rule.technology)
        assert.isDefined(description)

        const key = constructScenarioName(rule)

        const entry = {
            name: description.name,
            quality: rule.weight,
        }

        const found = scenarios.find(it => it.key === key)

        if (found) {
            found.technologies.push(entry)
        } else {
            scenarios.push({
                key,
                component: rule.component,
                operations: rule.operations,
                artifact: rule.artifact,
                hosting: rule.hosting,
                svg: svgs['rule.' + rule.technology + '.' + (index + 1)],
                technologies: [entry],
            })
        }
    }

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
            data: rules,
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

// TODO: get rid of this
type TechnologyRuleScenario = {
    key: string
    component: string
    operations?: string[]
    artifact?: string
    hosting: string[]
    svg: string
    technologies: {
        name: string
        quality: number
    }[]
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

function generateTopology(rule: TechnologyRule) {
    assert.isDefined(rule.hosting)

    const artifact_types: ArtifactTypeMap = {}
    const node_types: ArtifactTypeMap = {}
    const node_templates: NodeTemplateMap = {}

    /**
     * Component
     */
    const component: NodeTemplate = {
        type: rule.component,
    }

    if (check.isDefined(rule.operations) && utils.isPopulated(rule.operations)) {
        component.interfaces = {
            [MANAGEMENT_INTERFACE]: {
                operations: rule.operations.reduce<{[operation: string]: string}>((acc, cur) => {
                    acc[cur] = 'implementation'
                    return acc
                }, {}),
            },
        }
    }

    node_templates['component'] = component
    node_types[rule.component] = {
        metadata: {
            [METADATA.VINTNER_LINK]: generateLink(rule.component),
        },
    }

    /**
     * Artifact
     */
    if (check.isDefined(rule.artifact)) {
        component.artifacts = {
            artifact: {
                type: rule.artifact,
                file: 'dummy',
            },
        }

        artifact_types[rule.artifact] = {
            derived_from: rule.artifact,
            metadata: {
                [METADATA.VINTNER_LINK]: generateLink(rule.artifact),
            },
        }
    }

    /**
     * Hosting
     */
    rule.hosting.forEach((type, index) => {
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
