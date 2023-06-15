import * as files from '#files'
import * as path from 'path'
import {loadAllTests} from '../../../tests/query/QueryTest'
import {renderFile} from '../utils'

async function main() {
    const documentationDirectory = path.join('docs', 'docs', 'queries4tosca', 'tests')
    files.removeDirectory(documentationDirectory)
    files.createDirectory(documentationDirectory)

    const tests = loadAllTests()

    await renderFile(
        path.join(__dirname, 'introduction.template.ejs'),
        {tests},
        path.join(documentationDirectory, 'introduction.md')
    )

    for (const test of tests) {
        await renderFile(
            path.join(__dirname, 'test.template.ejs'),
            {test, utils: {toYAML: files.toYAML}},
            path.join(documentationDirectory, test.toDocFile())
        )
    }
}

main()
