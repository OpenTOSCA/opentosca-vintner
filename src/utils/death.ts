import hae from '#utils/hae'

type Element = {stop: () => Promise<void> | void}
const list: Element[] = []

export default {
    register: (element: Element) => list.push(element),
}

process.on('SIGINT', hae.exit(shutdown))
process.on('SIGTERM', hae.exit(shutdown))

async function shutdown() {
    for (const element of list) {
        await element.stop()
    }
}
