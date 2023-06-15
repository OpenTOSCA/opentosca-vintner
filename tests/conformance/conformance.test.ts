import * as files from '#files'
import path from 'path'
import {VariabilityTestGroup} from '../../src/controller/template/test'
import {runGroups} from '../utils'

describe('conformance', async () => {
    try {
        const groups: VariabilityTestGroup[] = []

        for (const group of files.listDirectories(path.join(__dirname)).filter(it => !it.startsWith('.'))) {
            const groupDir = path.join(__dirname, group)
            groups.push({
                name: group,
                tests: files.listDirectories(groupDir).map(test => ({name: test, dir: path.join(groupDir, test)})),
            })
        }

        runGroups(groups)
    } catch (e) {
        console.log(e)
        process.exit(1)
    }
})
