import benchmark, {generateBenchmarkServiceTemplate} from '#controller/setup/benchmark'
import Loader from '#graph/loader'
import {expect} from 'chai'
import * as path from 'path'

describe('benchmark', () => {
    it('run', async () => {
        await benchmark({seeds: [2], runs: 1, io: true})
    })

    it('generate service template', () => {
        const result = generateBenchmarkServiceTemplate(2)
        expect(result).to.deep.equal(new Loader(path.join(__dirname, 'expected.yaml')).raw())
    })
})
