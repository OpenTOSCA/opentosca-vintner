import {VariabilityTestGroup} from '#controller/template/test'
import * as files from '#files'
import path from 'path'
import {runGroups} from './utils'

describe('examples', async () => {
    try {
        const groups: VariabilityTestGroup[] = []

        const examplesDir = path.join(__dirname, '..', 'examples')
        const examples = files.listDirectories(examplesDir).filter(it => !it.startsWith('.'))

        for (const example of examples) {
            const exampleDir = path.join(examplesDir, example)
            const testsPath = path.join(exampleDir, 'tests')
            if (!files.exists(testsPath)) continue

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
