import std from '#std'
import {loadAllTests} from './query-test'

describe('queries', async () => {
    try {
        for (const test of loadAllTests()) {
            it(test.id, test.toTest())
        }
    } catch (e) {
        std.log(e)
        process.exit(1)
    }
})
