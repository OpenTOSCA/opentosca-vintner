import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import {TechnologyAssignmentRulesMap} from '#spec/technology-template'
import path from 'path'

export default class Loader {
    private readonly dir: string
    private readonly file: string
    private template?: ServiceTemplate

    constructor(file: string) {
        this.file = file
        this.dir = files.getDirectory(file)
    }

    async load() {
        this.template = files.loadYAML<ServiceTemplate>(this.file)

        /**
         * Load technology rules
         */
        await this.loadTechnologyRules()

        /**
         * Load technology plugins
         */
        await this.loadTechnologyPlugins()

        return this.template
    }

    private async loadTechnologyPlugins() {
        // TODO: load plugins
    }

    private async loadTechnologyRules() {
        assert.isDefined(this.template, 'Template not loaded')

        assert.isDefined(this.template.topology_template)

        let rules = this.template.topology_template.variability?.technology_assignment_rules

        // TODO: docs
        /**
         * Load rules from specified file
         */
        if (check.isString(rules)) {
            rules = files.loadYAML<TechnologyAssignmentRulesMap>(path.join(this.dir, rules))
        }

        // TODO: docs
        /**
         * Load rules from default file
         */
        if (check.isUndefined(rules)) {
            if (files.exists(path.join(this.dir, 'rules.yaml'))) {
                rules = files.loadYAML<TechnologyAssignmentRulesMap>(path.join(this.dir, 'rules.yaml'))
            }
        }

        if (check.isUndefined(this.template.topology_template.variability))
            this.template.topology_template.variability = {inputs: {}}
        this.template.topology_template.variability.technology_assignment_rules = rules
    }
}
