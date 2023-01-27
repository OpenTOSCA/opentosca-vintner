import * as ejs from 'ejs'
import * as files from '../../src/utils/files'

export async function renderFile(source: string, data: ejs.Data, target: string) {
    const output = await ejs.renderFile(source, data, {async: true})
    files.storeFile(target, output)
}
