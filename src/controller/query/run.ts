import {Query, QueryResult, QueryResults} from '#/query/query'
import * as files from '../../utils/files'
import * as console from 'console'

export type QueryTemplateArguments = {
    query: string
    output?: string
    source?: 'file' | 'vintner' | 'winery'
    format?: 'json' | 'yaml'
}

export default async function (options: QueryTemplateArguments): Promise<QueryResults | QueryResult> {
    if (!options.source) options.source = 'vintner'
    if (!options.format) options.format = 'yaml'

    const query = new Query()
    const results = await query.resolve({query: options.query, source: options.source})

    if (options.output) {
        if (options.format === 'yaml') files.storeYAML(options.output, results)
        if (options.format === 'json') files.storeJSON(options.output, results)
    } else {
        if (options.format === 'yaml') console.log(files.toYAML(results))
        if (options.format === 'json') console.log(files.toJSON(results))
    }

    // TODO: return unwrapped results if only one result can be returned, e.g., when FROM is a single file
    const keys = Object.keys(results)
    if (keys.length === 1) return results[keys[0]]
    return results
}
