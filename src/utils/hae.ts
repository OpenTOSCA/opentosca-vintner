import console from 'console'
import Express from 'express'

function express(fn: Express.RequestHandler): Express.RequestHandler {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}

function exit<T>(action: (options: T) => Promise<void>): (options: T) => Promise<void> {
    return async (options: T) => {
        try {
            await action(options)
        } catch (e) {
            console.log(e)
            process.exit(1)
        }
    }
}

function log(fn: () => Promise<void>): () => void {
    return async () => {
        try {
            await fn()
        } catch (e) {
            console.log(e)
        }
    }
}

export default {
    express,
    exit,
    log,
}
