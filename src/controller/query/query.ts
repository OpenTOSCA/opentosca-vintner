import {QueryResolver} from '../../query/query-resolver';

export type QueryTemplateArguments = {
    query: string
}

export default async function executeQuery(options: QueryTemplateArguments) {
    console.log(`Executing query: ${options.query}`)
    const resolver = new QueryResolver()
    const result = resolver.resolve(options.query)
    if (result) {
        console.log("\nResult: \n" + JSON.stringify(result, null, 4))
    } else {
        console.log('No results found.')
    }
}
