import {Mutex} from 'async-mutex'

const mutexes: {[key: string]: Mutex} = {}

export default async function lock(key: string) {
    if (!mutexes[key]) mutexes[key] = new Mutex()
    return mutexes[key].acquire()
}

export const critical = async (key: string, fn: () => Promise<void> | void) => {
    if (!mutexes[key]) mutexes[key] = new Mutex()
    await mutexes[key].runExclusive(fn)
}
