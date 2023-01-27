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

    const result = await new Query().resolve({query: options.query, source: options.source})

    if (options.output) {
        if (options.format === 'yaml') files.storeYAML(options.output, result)
        if (options.format === 'json') files.storeJSON(options.output, result)
    }

    return result
}
