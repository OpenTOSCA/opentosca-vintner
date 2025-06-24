import * as check from '#check'
import * as files from '#files'
import Loader from '#graph/loader'
import {Query} from '#query/query'
import {getParentNode} from '#query/utils'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'

export type TemplateQueryOptions = {
    template: string
    output: string
}

export default function (options: TemplateQueryOptions) {
    const template = new Loader(options.template).raw()
    if (template.tosca_definitions_version !== TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3)
        throw new Error(`TOSCA definitions version "${template.tosca_definitions_version}" not supported`)

    const queryResolver = new TemplateQueryResolver(template)
    const result = queryResolver.findAndRunQueries()
    files.storeYAML(options.output, result)
}

export class TemplateQueryResolver {
    private readonly serviceTemplate: ServiceTemplate
    private resolver = new Query()

    // This regex checks if a given string is a query command ( executeQuery(...) )
    private readonly queryRegex = /executeQuery\(([^)]+)\)/

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
    }

    /**
     * Identifies all queries within a template and runs them
     * @returns The service template with all queries resolved
     */
    findAndRunQueries(): ServiceTemplate {
        let resolvedTemplate = this.serviceTemplate
        let numberOfQueries = 0
        // Recursively go through template to find any queries and resolve them
        const recursiveRun = (object: any, path: string) => {
            if (check.isString(object)) {
                if (this.queryRegex.test(object)) {
                    numberOfQueries++
                    const match = object.match(this.queryRegex)?.pop() || ''
                    const queryResult = this.runQuery(path, match)
                    // if result is also a query, leave this entry as it is and let it resolve in a later loop
                    return check.isString(queryResult) && this.queryRegex.test(queryResult) ? object : queryResult
                } else {
                    return object
                }
            }
            if (typeof object == 'object') {
                if (object === null) return null
                Object.keys(object).forEach(key => {
                    object[key] = recursiveRun(object[key], path + '.' + key)
                })
            }
            return object
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
            if (numberOfQueries > 0 && previousNumberOfQueries == numberOfQueries) {
                throw new Error('Circular dependencies detected. Unable to resolve queries in your template.')
            } else if (numberOfQueries == 0 && previousNumberOfQueries == 0) {
                throw new Error('No queries found to resolve.')
            }
        } while (numberOfQueries > 0)
        return resolvedTemplate
    }

    private runQuery(context: string, query: string): object {
        const queryResult = this.resolver.resolveFromTemplate(query, getParentNode(context), this.serviceTemplate)
        if (!queryResult)
            throw new Error(
                `Resolving queries failed. The following query in your template evaluated to null: ${query}`
            )
        return queryResult
    }
}
