import {Resolver} from '../../query/resolver'
import * as files from '../../utils/files'

export type QueryTemplateArguments = {
    output: string
    query: string
    source: 'file' | 'vintner' | 'winery'
}

export default function executeQuery(options: QueryTemplateArguments) {
    const resolver = new Resolver()
    const results = resolver.resolve(options)
    if (results.length > 0) {
        for (const r of results)
            console.log("\nResults in " + r.name + ": \n" + JSON.stringify(r.result, null, 4))
        if (options.output) {
            files.storeFile(options.output, (results.length == 1)? results[0].result : results)
        }
    } else {
        console.log('No results found.')
    }
}
