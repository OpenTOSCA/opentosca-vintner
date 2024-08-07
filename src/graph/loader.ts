import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import Graph from '#graph/graph'
import {TechnologyPluginBuilder} from '#graph/plugin'
import {ServiceTemplate} from '#spec/service-template'
import {TechnologyAssignmentRulesMap} from '#spec/technology-template'
import {TypeSpecificLogicExpressions} from '#spec/variability'
import _ from 'lodash'
import path from 'path'

export default class Loader {
    private readonly dir: string
    private readonly file: string

    private serviceTemplate?: ServiceTemplate
    private graph?: Graph
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

        let rules = this.serviceTemplate.topology_template.variability?.technology_assignment_rules

        /**
         * Load rules from specified file
         */
        if (check.isString(rules)) {
            rules = files.loadYAML<TechnologyAssignmentRulesMap>(path.join(this.dir, rules))
        }

        /**
         * Load rules from default file
         */
        if (check.isUndefined(rules)) {
            if (files.exists(path.join(this.dir, 'rules.yaml'))) {
                rules = files.loadYAML<TechnologyAssignmentRulesMap>(path.join(this.dir, 'rules.yaml'))
            }
        }

        /**
         * Load rules from other default file
         */
        if (check.isUndefined(rules)) {
            if (files.exists(path.join(this.dir, 'lib', 'rules.yaml'))) {
                rules = files.loadYAML<TechnologyAssignmentRulesMap>(path.join(this.dir, 'lib', 'rules.yaml'))
            }
        }

        if (check.isUndefined(this.serviceTemplate.topology_template.variability))
            this.serviceTemplate.topology_template.variability = {}
        this.serviceTemplate.topology_template.variability.technology_assignment_rules = rules
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
}
