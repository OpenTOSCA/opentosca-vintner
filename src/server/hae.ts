import express from 'express'

/**
 * Wrap async function into promise to catch errors
 */
export default (fn: express.RequestHandler): express.RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}
