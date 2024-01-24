import Enricher from '#enricher'
import * as files from '#files'
import Graph from '#graph/graph'
import Solver from '#resolver/solver'
import {ServiceTemplate} from '#spec/service-template'
import std from '#std'
import * as utils from '#utils'
import * as yaml from 'js-yaml'
import path from 'path'

const PLAY = 'play'

describe('minisat', () => {
    it('play', async () => {
        await play(files.loadFile(path.join(__dirname, 'plays', PLAY + '.yaml')))
    })
})

async function play(data: string) {
    const template = yaml.load(data) as ServiceTemplate
    await Enricher.enrich({template})

    const solver = new Solver(new Graph(template))
    const results = solver.runAll().map(it => utils.sort(it))
    std.log(`Results: ${results.length}`)
    std.log(results)
}
