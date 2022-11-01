import {RepoPlugin} from '../query/plugins'
import {ServiceTemplate} from '../specification/service-template'
import path from 'path'
import os from 'os'
import * as files from '../utils/files'
import glob from 'glob'

export class Winery implements RepoPlugin {
    private readonly templatePath: string

    constructor() {
        this.templatePath = path.join(this.getRepo(),'servicetemplates')
    }

    /**
     * Returns all service templates in the winery repository. The directory name is set as the name of the template
     */
    getAllTemplates(): {name: string, template: ServiceTemplate}[] {
        // ensure that our path is in POSIX format for glob
        const searchPattern = path.join(this.templatePath,('/**/ServiceTemplate.tosca')).split(path.sep).join(path.posix.sep)
        // use glob to recursively search all files named 'ServiceTemplate.tosca' within the repo
        return glob.sync(searchPattern).map((v, i) =>
            (
                {
                    name: v.split("/")[v.split("/").length - 2],
                    template: files.loadYAML(v)
                }
            ))
    }

    /**
     * Returns a single template from a specified path in the winery repository
     * @param name The name/path of the template
     */
    getTemplate(name: string): {name: string, template: ServiceTemplate} {
        const templatePath =
            path.resolve(path.join(this.templatePath,
                name,
                'ServiceTemplate.tosca'))
        return {name: name, template: files.loadYAML(templatePath)}
    }

    /**
     * Determines the path of the winery repository on this machine by examining the config file in home/.winery
     */
    getRepo(): string {
        const wineryConfigPath = path.resolve(path.join(os.homedir(), '.winery', 'winery.yml'))
        try {
            const wineryConfig = files.loadYAML(path.resolve(wineryConfigPath)) as {repository: {repositoryRoot: string}}
            return wineryConfig.repository.repositoryRoot
        } catch (e: unknown) {
            console.error('Unable to find Winery configuration file. Cannot execute query on winery repository.')
        }
        return ''
    }
}
