import EventEmitter from 'events'

export const emitter = new EventEmitter()

export enum events {
    start_adaptation = 'start_adaptation',
    stop_adaptation = 'stop_adaptation',
}

export function onMessage<T>(event: string) {
    return new Promise<T>(resolve => {
        emitter.once(event, resolve)
    })
}
