import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import Graph from '#graph/graph'
import {ArtifactTypeMap} from '#spec/artifact-type'
import {NodeTemplate, NodeTemplateMap} from '#spec/node-template'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {TechnologyAssignmentRule, TechnologyAssignmentRulesMap} from '#spec/technology-template'
import std from '#std'
import Registry from '#technologies/plugins/rules/registry'
import {METADATA} from '#technologies/plugins/rules/types'
import * as utils from '#utils'
import * as puml from '#utils/puml'
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
    for (const [technology, rules] of Object.entries(map)) {
        for (const [index, rule] of rules.entries()) {
            const id = 'rule.' + technology + '.' + (index + 1)
            const template = generateTopology(rule)
            const graph = new Graph(template)
            std.log(`rendering ${id}`)
            svgs[id] = await puml.renderTopology(graph, {format: 'svg'})
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
            utils,
            link: (type: string) => {
                if (type === '*') return type
                return `[${type}](${generateLink(type)}){target=_blank}`
            },
            descriptions,
        },
        path.join(dir, 'index.md')
    )

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const why = await import('why-is-node-running')
    console.log(why)
    //@ts-ignore
    why.default()
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
        const name = 'host' + index

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
            const previous = node_templates['host' + (index - 1)]
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
