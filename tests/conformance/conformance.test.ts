import {VariabilityTestGroup} from '#controller/template/test'
import * as files from '#files'
import std from '#std'
import path from 'path'
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
        std.log(e)
        process.exit(1)
    }
})
