import _adapt from './adapt'
import _clean from './clean'
import _code from './code'
import _continue from './continue'
import _delete from './delete'
import _deploy from './deploy'
import _info from './info'
import _init from './init'
import _inspect from './inspect'
import _list from './list'
import _open from './open'
import _outputs from './outputs'
import _path from './path'
import _resolve from './resolve'
import _swap from './swap'
import _unadapt from './unadapt'
import _undeploy from './undeploy'
import _update from './update'

export default {
    init: _init,
    delete: _delete,
    deploy: _deploy,
    outputs: _outputs,
    inspect: _inspect,
    list: _list,
    open: _open,
    code: _code,
    path: _path,
    undeploy: _undeploy,
    continue: _continue,
    update: _update,
    resolve: _resolve,
    adapt: _adapt,
    unadapt: _unadapt,
    swap: _swap,
    info: _info,
    clean: _clean,
}
