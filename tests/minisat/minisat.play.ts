import Enricher from '#enricher'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import {hotfixBratans} from '#resolver'
import Solver from '#resolver/solver'
import std from '#std'
import * as utils from '#utils'
import path from 'path'

const PLAY = 'play'

describe('minisat', () => {
    it('play', async () => {
        const file = path.join(__dirname, 'plays', PLAY + '.yaml')

        const template = await new Loader(file).load()

        await new Enricher(template, {cleanTypes: false}).run()

        hotfixBratans(template)

        const solver = new Solver(new Graph(template), {})

        const results = solver.runAll().map(it => utils.sort(it))
        std.log(`Results: ${results.length}`)
        std.log(results)
    })
})
