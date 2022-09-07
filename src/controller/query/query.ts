import {QueryResolver} from '../../query/query-resolver';

export type QueryTemplateArguments = {
    query: string
}

export default async function executeQuery(options: QueryTemplateArguments) {
    console.log(`Executing query: ${options.query}`)
    const resolver = new QueryResolver()
    const results = resolver.resolve(options.query)
    if (results.length > 0) {
        for (const r of results)
            if (r.result) {
                console.log("\nResults in " + r.name + ": \n" + JSON.stringify(r.result, null, 4))
            }
    } else {
        console.log('No results found.')
    }
}
