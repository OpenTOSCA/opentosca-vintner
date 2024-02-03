import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import Graph from '#graph/graph'
import {TechnologyPluginBuilder} from '#graph/plugin'
import {ServiceTemplate} from '#spec/service-template'
import {TechnologyAssignmentRulesMap} from '#spec/technology-template'
import {TypeSpecificLogicExpressions} from '#spec/variability'
import path from 'path'

export default class Loader {
    private readonly dir: string
    private readonly file: string

    private serviceTemplate?: ServiceTemplate
    private graph?: Graph

    constructor(file: string) {
        this.file = file
        this.dir = files.getDirectory(file)
    }

    async load() {
        this.serviceTemplate = files.loadYAML<ServiceTemplate>(this.file)

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
        assert.isDefined(this.serviceTemplate.topology_template)

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
        assert.isDefined(this.serviceTemplate.topology_template)

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

        if (check.isUndefined(this.serviceTemplate.topology_template.variability))
            this.serviceTemplate.topology_template.variability = {}
        this.serviceTemplate.topology_template.variability.technology_assignment_rules = rules
    }

    private async loadTechnologyPluginBuilders() {
        assert.isDefined(this.serviceTemplate, 'Template not loaded')
        assert.isDefined(this.serviceTemplate.topology_template)

        if (check.isUndefined(this.serviceTemplate.topology_template.variability))
            this.serviceTemplate.topology_template.variability = {}

        if (check.isUndefined(this.serviceTemplate.topology_template.variability.plugins))
            this.serviceTemplate.topology_template.variability.plugins = {}

        if (check.isUndefined(this.serviceTemplate.topology_template.variability.plugins.technology))
            this.serviceTemplate.topology_template.variability.plugins.technology = []

        const files = this.serviceTemplate.topology_template.variability.plugins.technology

        // TODO: add plugins from ./plugins/technology/<PLUGIN DIR>/index.js to files

        const plugins: TechnologyPluginBuilder[] = []
        for (const file of files) {
            assert.isString(file)
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const plugin: TechnologyPluginBuilder = require('.\\' + path.relative(__dirname, path.join(this.dir, file)))
            console.log(plugin, path.join(this.dir, file), path.relative(__dirname, path.join(this.dir, file)))
            plugins.push(plugin)
        }

        this.serviceTemplate.topology_template.variability.plugins.technology = plugins
    }
}
