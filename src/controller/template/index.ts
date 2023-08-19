import _init from './init'
import _inputs from './inputs'
import _package from './package'
import PUMLController from './puml'
import _query from './query'
import _resolve from './resolve'
import _stats from './stats'
import _test from './test'
import _unpackage from './unpackage'

export default {
    init: _init,
    package: _package,
    unpackage: _unpackage,
    resolve: _resolve,
    query: _query,
    test: _test,
    inputs: _inputs,
    stats: _stats,
    puml: PUMLController,
}
