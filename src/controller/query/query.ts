import {Parser} from '../../query/parser';

export type QueryTemplateArguments = {
    query: string
}

export default async function executeQuery(options: QueryTemplateArguments) {
    console.log(`Executing query: ${options.query}`)
    const parser = new Parser
    parser.parse(options.query)
}
