import {Mutex, tryAcquire} from 'async-mutex'

const mutexes: {[key: string]: Mutex} = {}

async function lock(key: string) {
    if (!mutexes[key]) mutexes[key] = new Mutex()
    return mutexes[key].acquire()
}

async function wait(key: string, fn: () => Promise<void> | void) {
    if (!mutexes[key]) mutexes[key] = new Mutex()
    await mutexes[key].runExclusive(fn)
}

async function _try(key: string, fn: () => Promise<void> | void) {
    if (!mutexes[key]) mutexes[key] = new Mutex()
    await tryAcquire(mutexes[key]).runExclusive(fn)
}

export default {
    lock,
    wait,
    try: _try,
}
