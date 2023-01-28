import * as files from '#files'
import path from 'path'
import {runGroups} from '../utils'
import {VariabilityTestGroup} from '../../src/controller/template/test'

describe('conformance', async () => {
    const groups: VariabilityTestGroup[] = []

    for (const group of files.listDirectories(path.join(__dirname))) {
        const groupDir = path.join(__dirname, group)
        groups.push({
            name: group,
            tests: files.listDirectories(groupDir).map(test => ({name: test, dir: path.join(groupDir, test)})),
        })
    }

    runGroups(groups)
})
