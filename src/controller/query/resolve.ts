import * as files from '../../utils/files'
import {Resolver} from '../../query/resolver'
import {ServiceTemplate} from '../../specification/service-template'
import {Instance} from '../../repository/instances'
import {isString} from '../../utils/validator'

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

    // This regex checks if a given string is a query command ( executeQuery(...) )
    private readonly queryRegex = /executeQuery\(([^)]+)\)/

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
    }

    findAndRunQueries() {
        let resolvedTemplate = this.serviceTemplate
        let numberOfQueries = 0
        // Recursively go through template to find any queries and resolve them
        const recursiveRun = (object: any, path: string) => {
            if (isString(object)) {
                if (this.queryRegex.test(object)) {
                    numberOfQueries++
                    const match = object.match(this.queryRegex)?.pop() || ''
                    const queryResult = this.runQuery(path, match)
                    // if query result is itself a query, leave it in and let it resolve in a later loop
                    return isString(queryResult) && this.queryRegex.test(queryResult) ? object : queryResult
                } else {
                    return object
                }
            }
            if (typeof object === 'object') {
                if (object === null) return null
                Object.keys(object).forEach(key => {
                    object[key] = recursiveRun(object[key], path + '.' + key)
                })
                return object
            }
        }
        /*
        This loop keeps track of the number of queries still in the template and repeats if there are more than 0
        If this number is equal to the previous loop, it means that no queries got resolved, which is most likely
        the result of a circular dependency. In this case, throw an error
         */
        do {
            const previousNumberOfQueries = numberOfQueries
            numberOfQueries = 0
            resolvedTemplate = recursiveRun(resolvedTemplate, '')
            if (previousNumberOfQueries == numberOfQueries)
                throw new Error('Circular dependencies detected. Unable to resolve queries in your template.')
        } while (numberOfQueries > 0)
        return resolvedTemplate
    }

    private runQuery(context: string, query: string): Object {
        const queryResult = this.resolver.resolveFromTemplate(query, this.serviceTemplate)
        if (!queryResult)
            throw new Error(
                `Resolving queries failed. The following query in your template evaluated to null: ${query}`
            )
        return queryResult
    }
}
