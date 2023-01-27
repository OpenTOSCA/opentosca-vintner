import {TemplatesRepositoryPlugin} from '#plugins/types'
import {ServiceTemplate} from '#spec/service-template'
import path from 'path'
import os from 'os'
import * as files from '../utils/files'
import glob from 'glob'

export class WineryPlugin implements TemplatesRepositoryPlugin {
    private readonly templatesPath: string

    constructor() {
        this.templatesPath = this.getTemplatesPath()
    }

    /**
     * Returns all service templates in the winery repository. The directory name is set as the name of the template
     */
    async getTemplates() {
        // ensure that our path is in POSIX format for glob
        const searchPattern = path
            .join(this.templatesPath, '/**/ServiceTemplate.tosca')
            .split(path.sep)
            .join(path.posix.sep)
        // use glob to recursively search all files named 'ServiceTemplate.tosca' within the repo
        return glob.sync(searchPattern).map(v => ({
            name: v.split('/')[v.split('/').length - 2],
            template: files.loadYAML<ServiceTemplate>(v),
        }))
    }

    /**
     * Returns a single template from a specified path in the winery repository
     * @param name The name of the template
     */
    async getTemplate(name: string) {
        return {name, template: files.loadYAML<ServiceTemplate>(this.getTemplatePath(name))}
    }

    getTemplatePath(name: string) {
        return path.join(this.templatesPath, name, 'ServiceTemplate.tosca')
    }

    getTemplatesPath() {
        return path.join(this.getRepositoryPath(), 'servicetemplates')
    }

    /**
     * Determines the path of the winery repository on this machine by examining the config file in home/.winery
     */
    getRepositoryPath(): string {
        const wineryConfigPath = path.join(os.homedir(), '.winery', 'winery.yml')
        const wineryConfig = files.loadYAML<{
            repository: {repositoryRoot: string}
        }>(wineryConfigPath)
        return wineryConfig.repository.repositoryRoot
    }
}
