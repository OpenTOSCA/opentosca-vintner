import {QueryResolver} from '../../query/query-resolver';

export type QueryTemplateArguments = {
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
                // Flatten the result if it is only one element
                const result = (r.result.length == 1)? r.result[0] : r.result
                console.log("\nResults in " + r.name + ": \n" + JSON.stringify(result, null, 4))
                // storeFile("test.yaml", stringify(result))
            }
    } else {
        console.log('No results found.')
    }
}
