import * as files from '#files'
import Loader from '#graph/loader'
import glob from 'glob'
import os from 'os'
import path from 'path'
import {TemplatesRepository} from './index'

export class WineryTemplatesRepository implements TemplatesRepository {
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
            template: new Loader(v).raw(),
        }))
    }

    /**
     * Returns a single template from a specified path in the winery repository
     * @param name The name of the template
     */
    async getTemplate(name: string) {
        return {name, template: new Loader(this.getTemplatePath(name)).raw()}
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
