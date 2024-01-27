import hae from '#utils/hae'
import process from 'process'

type Element = {stop: () => Promise<void> | void}
const list: Element[] = []

export default {
    register: (element: Element) => list.push(element),
}
async function shutdown() {
    for (const element of list) {
        await element.stop()
    }
    process.exit()
}

process.on('SIGINT', hae.exit(shutdown))
process.on('SIGTERM', hae.exit(shutdown))
