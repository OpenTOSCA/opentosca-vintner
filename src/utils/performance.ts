import process from 'process'

const store: {[key: string]: bigint[] | undefined} = {}

function start(mark: string) {
    const timestamp = process.hrtime.bigint()
    const entry = get(mark)
    entry.push(timestamp)
}

function get(mark: string): bigint[] {
    if (!store[mark]) store[mark] = []
    return store[mark]!
}

function clear(mark: string) {
    delete store[mark]
}

function stop(mark: string) {
    const timestamp = process.hrtime.bigint()
    const entry = get(mark)
    entry.push(timestamp)
}

function duration(mark: string) {
    const entry = get(mark)
    let output = 0n
    for (let i = 0; i < entry.length; i += 2) {
        output += entry[i + 1] - entry[i]
    }
    return Number(output / 1_000_000n)
}

export default {start, stop, duration, clear}
