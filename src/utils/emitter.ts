import EventEmitter from 'events'

export const emitter = new EventEmitter()

export function onMessage<T>(event: string) {
    return new Promise<T>(resolve => {
        emitter.once(event, resolve)
    })
}
