import exprs from 'express'

function express(fn: exprs.RequestHandler): exprs.RequestHandler {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}

function exit(action: (options: any) => Promise<void>): (options: any) => Promise<void> {
    return async (options: any) => {
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
    exit,
    log,
    express,
}
