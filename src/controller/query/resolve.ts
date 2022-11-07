import * as files from '../../utils/files'
import {Resolver} from '../../query/resolver'
import {ServiceTemplate} from '../../specification/service-template'
import {Instance} from '../../repository/instances'

export type QueryResolveTemplateArguments = {
    template: string
    output: string
    source: 'file' | 'vintner' | 'winery'
}

export default function resolveQueries(options: QueryResolveTemplateArguments): void {
    const {template, output} = options
    const serviceTemplate = files.loadYAML<ServiceTemplate>(new Instance(template).getServiceTemplatePath())
    const queryResolver = new TemplateQueryResolver(serviceTemplate)
    const result = queryResolver.findAndRunQueries()
    files.storeYAML(output, result)
}

export class TemplateQueryResolver {
    private readonly serviceTemplate: ServiceTemplate
    private resolver = new Resolver()

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
    }

    findAndRunQueries() {
        // Regex to find query commands
        const regExp = /executeQuery\(([^)]+)\)/

        // Recursively go through template to find any queries and resolve them
        const recursiveRun = (object: any, path: string) => {
            if (typeof object === 'string') {
                if (regExp.test(object)) {
                    const match = object.match(regExp)?.pop() || ''
                    return this.runQuery(path, match)
                } else {
                    return object
                }
            }
            if (typeof object === 'object') {
                if (object === null) return null
                Object.keys(object).forEach((key) => {
                    object[key] = recursiveRun(object[key], path + '.' + key)
                })
                return object;
            }
        }
        return recursiveRun(this.serviceTemplate, '');
    }

    private runQuery(context: string, query: string): any {
        console.log(context)
        const queryResult = this.resolver.resolveFromTemplate(query, this.serviceTemplate)
        if (!queryResult) throw new Error (
            `Resolving queries failed. The following query in your template evaluated to null: ${query}`
        )
        return queryResult
    }
}
