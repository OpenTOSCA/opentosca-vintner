import {Mutex} from 'async-mutex'
import console from 'console'

// TODO: custom decorators for locks
// TODO: cross-process mutex so that cli and server can operate at the same time!
// TODO: allow to lock multiple keys on the same time, e.g., required when creating a new instance

const mutexes: {[key: string]: Mutex} = {}

export default async function lock(key: string) {
    if (!mutexes[key]) mutexes[key] = new Mutex()
    return mutexes[key].acquire()
}

export const critical = async (key: string, fn: () => Promise<void> | void) => {
    console.log(1)
    if (!mutexes[key]) mutexes[key] = new Mutex()
    console.log(2)
    await mutexes[key].runExclusive(fn)
    console.log(3)
}
