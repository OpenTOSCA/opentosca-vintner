import _enrich from './enrich'
import _implement from './implement'
import _init from './init'
import _inputs from './inputs'
import _normalize from './normalize'
import _package from './package'
import _pull from './pull'
import PUMLController from './puml'
import _quality from './quality'
import _query from './query'
import _resolve from './resolve'
import _sign from './sign'
import _stats from './stats'
import _test from './test'
import _unimplement from './unimplement'
import _unpackage from './unpackage'
import _unpull from './unpull'
import _verify from './verify'

export default {
    puml: PUMLController,
    enrich: _enrich,
    init: _init,
    implement: _implement,
    unimplement: _unimplement,
    package: _package,
    unpackage: _unpackage,
    resolve: _resolve,
    query: _query,
    test: _test,
    inputs: _inputs,
    stats: _stats,
    normalize: _normalize,
    sign: _sign,
    verify: _verify,
    pull: _pull,
    quality: _quality,
    unpull: _unpull,
}
