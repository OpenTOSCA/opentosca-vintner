import * as path from 'path'
import * as ejs from 'ejs'
import * as files from '#files'

async function main() {
    const dir = path.join('docs', 'docs', 'variability4tosca', 'conformance-tests')

    files.removeDirectory(dir)
    files.createDirectory(dir)

    const data = {}
    const output = await ejs.renderFile(path.join(__dirname, 'template.ejs'), {data}, {async: true})
    files.storeFile(path.join(dir, 'introduction.md'), output)
}

main()
