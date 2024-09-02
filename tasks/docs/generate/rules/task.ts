import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import Graph from '#graph/graph'
import * as puml from '#puml'
import {ArtifactTypeMap} from '#spec/artifact-type'
import {NodeTemplate, NodeTemplateMap} from '#spec/node-template'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {TechnologyAssignmentRule, TechnologyAssignmentRulesMap} from '#spec/technology-template'
import Registry from '#technologies/plugins/rules/registry'
import {METADATA} from '#technologies/plugins/rules/types'
import {constructRuleName} from '#technologies/utils'
import * as utils from '#utils'
import path from 'path'
import process from 'process'
import descriptions from './technologies'

async function main() {
    /**
     * Directory
     */
    const dir = path.join('docs', 'docs', 'variability4tosca', 'rules')
    files.removeDirectory(dir)
    files.createDirectory(dir)

    /**
     * Rules
     */
    const map = Registry.rules
    files.storeYAML<TechnologyAssignmentRulesMap>(path.join(dir, 'technology-rules.yaml'), map)

    /**
     * Pattern
     */
    const svgs: {[key: string]: string} = {}
    const renderPromises = []
    for (const [technology, rules] of Object.entries(map)) {
        for (const [index, rule] of rules.entries()) {
            const id = 'rule.' + technology + '.' + (index + 1)
            const template = generateTopology(rule)
            const graph = new Graph(template)
            const promise = puml.renderTopology(graph, {format: 'svg'}).then(svg => {
                svgs[id] = svg
            })
            renderPromises.push(promise)
        }
    }
    await Promise.all(renderPromises)

    /**
     * Groups
     */
    type TechnologyRuleGroup = {
        key: string
        component: string
        artifact?: string
        hosting: string[]
        svg: string
        technologies: {
            name: string
            quality: number
            reason: string
            details: string
        }[]
    }
    const groups: TechnologyRuleGroup[] = []
    for (const [technology, rules] of Object.entries(map)) {
        const description = descriptions.find(it => it.id === technology)
        assert.isDefined(description)

        for (const [index, rule] of rules.entries()) {
            assert.isArray(rule.hosting)

            const key = constructRuleName(
                {technology, component: rule.component, artifact: rule.artifact, hosting: rule.hosting},
                {technology: false}
            )

            const entry = {
                name: description.name,
                quality: rule.weight!,
                reason: rule.reason!,
                details: rule.details!,
            }

            const found = groups.find(it => it.key === key)

            if (found) {
                found.technologies.push(entry)
            } else {
                groups.push({
                    key,
                    component: rule.component,
                    artifact: rule.artifact,
                    hosting: rule.hosting,
                    svg: svgs['rule.' + technology + '.' + (index + 1)],
                    technologies: [entry],
                })
            }
        }
    }

    /**
     * Documentation
     */
    await files.renderFile(
        path.join(__dirname, 'template.ejs'),
        {
            data: map,
            svgs,
            groups,
            utils,
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

function generateLink(type: string) {
    return `/normative#${type.replaceAll('.', '')}`
}

function generateTopology(rule: TechnologyAssignmentRule) {
    const artifact_types: ArtifactTypeMap = {}
    const node_types: ArtifactTypeMap = {}
    const node_templates: NodeTemplateMap = {}

    /**
     * Component
     */
    const component: NodeTemplate = {
        type: rule.component,
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
    assert.isArray(rule.hosting)
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
