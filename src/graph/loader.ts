import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import {PROFILES_DIR, YAML_EXTENSIONS} from '#files'
import {EntityTypesKeys, ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {TechnologyRule} from '#spec/technology-template'
import {TypeSpecificLogicExpressions} from '#spec/variability'
import {TechnologyPluginBuilder} from '#technologies/types'
import {TECHNOLOGY_RULES_FILENAME} from '#technologies/utils'
import {UnexpectedError} from '#utils/error'
import _ from 'lodash'
import path from 'path'

export default class Loader {
    private readonly dir: string
    private readonly file: string

    private serviceTemplate?: ServiceTemplate
    private readonly override?: Partial<ServiceTemplate>

    constructor(file: string, override?: Partial<ServiceTemplate>) {
        this.file = file
        this.dir = files.getDirectory(file)
        this.override = override
    }

    raw() {
        return files.loadYAML<ServiceTemplate>(this.file)
    }

    async load() {
        this.serviceTemplate = this.raw()

        /**
         * Override
         */
        if (check.isDefined(this.override)) {
            this.serviceTemplate = _.merge(this.serviceTemplate, this.override)
        }

        /**
         * Load type-specific conditions
         */
        await this.loadTypeSpecificConditions()

        /**
         * Load technology rules
         */
        await this.loadTechnologyRules()

        /**
         * Load technology plugins
         */
        await this.loadTechnologyPluginBuilders()

        /**
         * Load types
         */
        await this.loadTypes()

        return this.serviceTemplate
    }

    private async loadTypeSpecificConditions() {
        assert.isDefined(this.serviceTemplate, 'Template not loaded')
        if (check.isUndefined(this.serviceTemplate.topology_template)) return

        let conditions = this.serviceTemplate.topology_template.variability?.type_specific_conditions

        /**
         * Load rules from specified file
         */
        if (check.isString(conditions)) {
            conditions = files.loadYAML<TypeSpecificLogicExpressions>(path.join(this.dir, conditions))
        }

        /**
         * Load rules from default file
         */
        if (check.isUndefined(conditions)) {
            if (files.exists(path.join(this.dir, 'type-specific-conditions.yaml'))) {
                conditions = files.loadYAML<TypeSpecificLogicExpressions>(
                    path.join(this.dir, 'type-specific-conditions.yaml')
                )
            }
        }

        if (check.isUndefined(this.serviceTemplate.topology_template.variability))
            this.serviceTemplate.topology_template.variability = {}
        this.serviceTemplate.topology_template.variability.type_specific_conditions = conditions
    }

    private async loadTechnologyRules() {
        assert.isDefined(this.serviceTemplate, 'Template not loaded')
        if (check.isUndefined(this.serviceTemplate.topology_template)) return

        let rules = this.serviceTemplate.topology_template.variability?.technology_rules

        /**
         * Load rules from specified file
         */
        if (check.isString(rules)) {
            rules = files.loadYAML<TechnologyRule[]>(path.join(this.dir, rules))
        }

        /**
         * Load rules from default file
         */
        if (check.isUndefined(rules)) {
            if (files.exists(path.join(this.dir, TECHNOLOGY_RULES_FILENAME))) {
                rules = files.loadYAML<TechnologyRule[]>(path.join(this.dir, TECHNOLOGY_RULES_FILENAME))
            }
        }

        /**
         * Load rules from other default file
         */
        if (check.isUndefined(rules)) {
            if (files.exists(path.join(this.dir, 'lib', TECHNOLOGY_RULES_FILENAME))) {
                rules = files.loadYAML<TechnologyRule[]>(path.join(this.dir, 'lib', TECHNOLOGY_RULES_FILENAME))
            }
        }

        if (check.isUndefined(this.serviceTemplate.topology_template.variability))
            this.serviceTemplate.topology_template.variability = {}
        this.serviceTemplate.topology_template.variability.technology_rules = rules
    }

    private async loadTechnologyPluginBuilders() {
        assert.isDefined(this.serviceTemplate, 'Template not loaded')
        if (check.isUndefined(this.serviceTemplate.topology_template)) return

        if (check.isUndefined(this.serviceTemplate.topology_template.variability))
            this.serviceTemplate.topology_template.variability = {}

        if (check.isUndefined(this.serviceTemplate.topology_template.variability.plugins))
            this.serviceTemplate.topology_template.variability.plugins = {}

        if (check.isUndefined(this.serviceTemplate.topology_template.variability.plugins.technology))
            this.serviceTemplate.topology_template.variability.plugins.technology = []

        /**
         * User-defined plugins
         */
        const sources = this.serviceTemplate.topology_template.variability.plugins.technology

        /**
         * Plugins from default location
         */
        const technologyPluginsDir = path.join(this.dir, 'plugins', 'technology')
        if (files.isDirectory(technologyPluginsDir))
            sources.push(...files.listDirectories(technologyPluginsDir).map(it => path.join(technologyPluginsDir, it)))

        /**
         * Load builders
         */
        const builders: TechnologyPluginBuilder[] = []
        for (const source of sources) {
            assert.isString(source)
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const builder: TechnologyPluginBuilder = require(path.isAbsolute(source)
                ? source
                : path.join(this.dir, source))
            builders.push(builder)
        }

        this.serviceTemplate.topology_template.variability.plugins.technology = builders
    }

    private async loadTypes() {
        /**
         * Preconditions
         */
        assert.isDefined(this.serviceTemplate, 'Template not loaded')

        /**
         * Candidates
         */
        const candidates = files.walkDirectory(PROFILES_DIR, {extensions: YAML_EXTENSIONS})

        /**
         * Lib
         */
        const lib = path.join(this.dir, 'lib')
        if (files.exists(lib)) candidates.push(...files.walkDirectory(lib, {extensions: YAML_EXTENSIONS}))

        /**
         * Load types of each file
         */
        for (const candidate of candidates) {
            const template = files.loadYAML<ServiceTemplate>(candidate)

            /**
             * Ensure YAML file is a TOSCA service template
             */
            if (check.isUndefined(template.tosca_definitions_version)) continue

            /**
             * Ensure version
             */
            if (template.tosca_definitions_version !== TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3)
                throw new Error(`TOSCA definitions version "${template.tosca_definitions_version}" not supported`)

            /**
             * Load types for each collection
             */
            for (const key of EntityTypesKeys) {
                if (check.isUndefined(this.serviceTemplate[key])) this.serviceTemplate[key] = {}
                const types = this.serviceTemplate[key]
                if (check.isUndefined(types)) throw new UnexpectedError()

                const loaded = template[key]
                if (check.isUndefined(loaded)) continue

                for (const [name, type] of Object.entries(loaded)) {
                    if (check.isDefined(types[name])) {
                        throw new Error(`${key} "${name}" duplicated in service template "${candidate}"`)
                    }

                    if (type.derived_from === name) throw new Error(`${key} "${name}" is derived from itself...`)

                    type._loaded = true
                    type._file = candidate
                    types[name] = type
                }
            }
        }
    }
}
