import {QueryResolver} from '../../query/query-resolver';
import * as files from '../../utils/files'

export type QueryTemplateArguments = {
    output: string
    query: string
    source: 'vintner' | 'file' | 'winery'
}

export default async function executeQuery(options: QueryTemplateArguments) {
    console.log(`Executing query: ${options.query}`)
    const resolver = new QueryResolver()
    const results = resolver.resolve(options)
    if (results.length > 0) {
        for (const r of results)
            if (r.result) {
                console.log("\nResults in " + r.name + ": \n" + JSON.stringify(r.result, null, 4))
            }
        if (options.output)
            files.storeFile(options.output, files.stringify(results[0].result))
    } else {
        console.log('No results found.')
    }
}
