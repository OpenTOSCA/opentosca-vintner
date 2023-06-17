import * as files from '#utils/files'
import * as ejs from 'ejs'

export async function renderFile(source: string, data: ejs.Data, target: string) {
    const output = await ejs.renderFile(source, data, {async: true})
    files.storeFile(target, output)
}
