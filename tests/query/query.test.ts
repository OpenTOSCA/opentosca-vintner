import {loadAllTests} from './query-test'

// TODO: fix this

describe.skip('queries', async () => {
    try {
        for (const test of loadAllTests()) {
            it(test.id, test.toTest())
        }
    } catch (e) {
        console.log(e)
        process.exit(1)
    }
})
