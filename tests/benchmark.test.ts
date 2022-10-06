import {expect} from 'chai'
import benchmark, {generateBenchmarkServiceTemplate} from '../src/controller/setup/benchmark'
import * as files from '../src/utils/files'
import {ServiceTemplate} from '../src/specification/service-template'
import * as path from 'path'
import {getDefaultTest} from './utils'

it('benchmark: run', () => {
    benchmark({seeds: [2], runs: 1})
})

it('generateBenchmarkServiceTemplate', () => {
    const result = generateBenchmarkServiceTemplate(2)
    expect(result).to.deep.equal(
        files.loadYAML<ServiceTemplate>(path.join(__dirname, 'benchmark', 'variable-service-template.yaml'))
    )
})

it('benchmark', getDefaultTest({}))
