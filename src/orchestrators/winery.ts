import {RepoPlugin} from '../query/plugins'
import {ServiceTemplate} from '../specification/service-template'
import path from 'path'
import os from 'os'
import * as yaml from 'js-yaml'
import fs from 'fs'
import * as files from '../utils/files'
import * as glob from 'glob'

export class Winery implements RepoPlugin {
    private readonly repoPath: string

    constructor() {
        this.repoPath = this.getRepo()
    }

    getAllTemplates(): {name: string, template: ServiceTemplate}[] {
        // ensure that our path is in POSIX format for glob
        const searchPattern = path.join(this.repoPath,('/**/ServiceTemplate.tosca')).split(path.sep).join(path.posix.sep)
        const templates: {name: string, template: ServiceTemplate}[] =
            glob.glob.sync(searchPattern).map((v, i) =>
            (
                {
                    name: v.split("/")[v.split("/").length - 2],
                    template: files.loadFile(v) as ServiceTemplate
                }
            ))
        return templates
    }

    getTemplate(name: string): {name: string, template: ServiceTemplate} {
        const templatePath =
            path.resolve(path.join(this.repoPath,
                'servicetemplates',
                name,
                'ServiceTemplate.tosca'))
        return {name: name, template: files.loadFile(templatePath) as ServiceTemplate};
    }

    getRepo(): any {
        const wineryConfigPath = path.resolve(path.join(os.homedir(), '.winery', 'winery.yml'))
        const wineryConfig = yaml.load(fs.readFileSync(path.resolve(wineryConfigPath), 'utf-8')) as {repository: {repositoryRoot: string}}
        return wineryConfig? wineryConfig.repository.repositoryRoot : ''
    }
}
