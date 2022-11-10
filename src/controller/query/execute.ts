import {Resolver} from '../../query/resolver'
import * as files from '../../utils/files'

export type QueryTemplateArguments = {
    output: string
    query: string
    source: 'file' | 'vintner' | 'winery'
}

export default function executeQuery(options: QueryTemplateArguments): Object {
    const resolver = new Resolver()
    // add missing default for REST calls
    if (!options.source) options.source = 'vintner'
    const results = resolver.resolve(options)
    if (results.length > 0) {
        for (const r of results) console.log('\nResults in ' + r.name + ': \n' + JSON.stringify(r.result, null, 4))
        if (options.output) {
            files.storeYAML(options.output, results.length == 1 ? results[0].result : results)
        }
    } else {
        console.log('No results found.')
    }
    return results.length == 1 ? results[0].result : results
}
