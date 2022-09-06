import {QueryResolver} from '../../query/query-resolver';

export type QueryTemplateArguments = {
    query: string
}

export default async function executeQuery(options: QueryTemplateArguments) {
    console.log(`Executing query: ${options.query}`)
    const resolver = new QueryResolver()
    if (resolver.resolve(options.query)) {
        console.log("\nResult: \n" + JSON.stringify(resolver.resolve(options.query), null, 4))
    } else {
        console.log('No results found.')
    }
}
