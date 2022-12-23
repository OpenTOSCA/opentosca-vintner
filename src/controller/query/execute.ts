import {Resolver} from '#/query/resolver'
import * as files from '../../utils/files'
import * as console from "console";

export type QueryTemplateArguments = {
    query: string
    output?: string
    source?: 'file' | 'vintner' | 'winery'
    format?: 'json' | 'yaml'
}

export default function (options: QueryTemplateArguments): Object {
    if (!options.source) options.source = 'vintner'
    if (!options.format) options.format = 'yaml'

    const _results = new Resolver().resolve({query: options.query, source: options.source})
    const results = _results.length === 0 ? {} : _results.length === 1 ? _results[0].result : _results

    if (options.output) {
        if (options.format === 'yaml') files.storeYAML(options.output, results)
        if (options.format === 'json') files.storeJSON(options.output, results)
    } else {
        if (options.format === 'yaml') console.log(files.toYAML(results))
        if (options.format === 'json') console.log(files.toJSON(results))
    }

    return results
}
