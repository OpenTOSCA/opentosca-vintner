import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import {YAML_EXTENSIONS} from '#files'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import {NORMATIVE_BASE_TYPES, NORMATIVE_BASE_TYPES_FILENAME} from '#normative/base'
import {NORMATIVE_SPECIFIC_TYPES, NORMATIVE_SPECIFIC_TYPES_FILENAME} from '#normative/specific'
import {NodeType} from '#spec/node-type'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {TechnologyAssignmentRulesMap} from '#spec/technology-template'
import std from '#std'
import registry from '#technologies/plugins/rules/registry'
import {
    GENERATION_MARK_REGEX,
    GENERATION_MARK_TEXT,
    GENERATION_NOTICE,
    TECHNOLOGY_RULES_FILENAME,
    isAbstract,
    isGenerate,
    isGenerated,
    isImplementation,
} from '#technologies/utils'
import * as utils from '#utils'
import path from 'path'

export type TemplateImplementOptions = {
    dir: string
    orchestrator: string
    experimental: string
}

export default async function (options: TemplateImplementOptions) {
    /**
     * Experimental
     */
    assert.isTrue(options.experimental)

    /**
     * Orchestrator
     */
    options.orchestrator = options.orchestrator ?? 'unfurl'
    if (options.orchestrator !== 'unfurl')
        throw new Error(`Orchestrator "${options.orchestrator}" not supported. Currently we only support "unfurl".`)

    /**
     * Lib
     */
    assert.isDefined(options.dir, 'Directory not defined')
    const lib = path.join(options.dir, 'lib')
    files.createDirectory(lib)

    /**
     * Normative Base Types
     */
    files.storeYAML<ServiceTemplate>(path.join(lib, NORMATIVE_BASE_TYPES_FILENAME), NORMATIVE_BASE_TYPES, {
        notice: true,
    })

    /**
     * Normative Specific Types
     */
    files.storeYAML<ServiceTemplate>(path.join(lib, NORMATIVE_SPECIFIC_TYPES_FILENAME), NORMATIVE_SPECIFIC_TYPES, {
        notice: true,
    })

    /**
     * Types Import
     */
    files.storeYAML<ServiceTemplate>(
        path.join(lib, 'types.yaml'),
        {
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
            imports: [NORMATIVE_SPECIFIC_TYPES_FILENAME],
        },
        {overwrite: false}
    )

    /**
     * Technology Rules
     */
    files.storeYAML<TechnologyAssignmentRulesMap>(path.join(lib, TECHNOLOGY_RULES_FILENAME), registry().rules, {
        notice: true,
    })

    /**
     * Graph
     */
    const template = await new Loader(path.join(options.dir, 'variable-service-template.yaml')).load()
    const graph = new Graph(template)

    /**
     * Implement
     */
    for (const file of files.walkDirectory(lib, {extensions: YAML_EXTENSIONS})) {
        std.log(`processing file "${file}"`)

        const templateString = files.loadFile(file)
        const templateData: ServiceTemplate = files.loadYAML<ServiceTemplate>(file)

        if (check.isUndefined(templateData.tosca_definitions_version)) {
            std.log(
                `ignoring file "${file}" since has no TOSCA Definitions Version and, hence, most likely is not a TOSCA Service Template`
            )
            continue
        }

        if (templateData.tosca_definitions_version !== TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3) {
            std.log(
                `ignoring file "${file}" since TOSCA Definitions Version "${template.tosca_definitions_version}" is not supported`
            )
            continue
        }

        if (check.isUndefined(templateData.node_types)) {
            std.log(`ignoring file "${file}" since it does not define Node Types`)
            continue
        }

        const implementations: {[key: string]: NodeType} = {}

        for (const [baseName, baseType] of Object.entries(templateData.node_types)) {
            // Ignore generated implementations
            if (isGenerated(baseType)) continue

            // Ignore manual modeled implementations
            if (isImplementation(baseName)) continue

            // Ignore manual ignored types
            if (!isGenerate(baseType)) continue

            // Ignore abstract types
            if (isAbstract(baseType)) continue

            std.log(`processing node type "${baseName}"`)

            for (const plugin of graph.plugins.technology) {
                for (const [implementationName, implementationType] of Object.entries(
                    plugin.implement(baseName, baseType)
                )) {
                    if (check.isDefined(implementations[implementationName]))
                        throw new Error(`Implementation "${implementationName}" is already defined`)
                    implementations[implementationName] = implementationType
                }
            }
        }

        if (utils.isEmpty(implementations)) {
            std.log(`no implementations must be written`)
            continue
        }

        const replaceString =
            '\n\n' +
            utils.indent(GENERATION_MARK_TEXT) +
            `\n\n` +
            utils.indent(GENERATION_NOTICE) +
            `\n\n` +
            utils.indent(files.toYAML(implementations))

        const resultString =
            (GENERATION_MARK_REGEX.test(templateString)
                ? templateString.trimEnd().replace(GENERATION_MARK_REGEX, replaceString)
                : templateString.trimEnd() + replaceString
            ).trimEnd() + '\n'

        if (templateString === resultString) {
            std.log('implementations did not change')
            continue
        }

        files.storeFile(file, files.formatYAML(resultString))
    }
}
