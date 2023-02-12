import * as files from '#files'
import path from 'path'
import {runGroups} from '../utils'
import {VariabilityTestGroup} from '../../src/controller/template/test'

describe('examples', async () => {
    try {
        const groups: VariabilityTestGroup[] = []

        const examplesDir = path.join(__dirname, '..', '..', 'examples')
        const examples = files.listDirectories(examplesDir).filter(it => !it.startsWith('.'))

        for (const example of examples) {
            const exampleDir = path.join(examplesDir, example)
            const testsPath = path.join(exampleDir, 'tests')
            groups.push({
                name: `example-${example}`,
                tests: files
                    .listDirectories(testsPath)
                    .map(test => ({name: test, dir: path.join(testsPath, test), vstdir: exampleDir})),
            })
        }

        runGroups(groups)
    } catch (e) {
        console.log(e)
        process.exit(1)
    }
})
