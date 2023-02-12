import bodyParser from 'body-parser'
import http from 'http'
import express from 'express'
import resolvers from './resolvers'
import type {ErrorRequestHandler} from 'express'
import createError from 'http-errors'
import cors from 'cors'
import hae from '#utils/hae'
import death from '#utils/death'
import console from 'console'

export default {
    create: function () {
        /**
         * Express Server
         */
        const expressServer = express()
        expressServer.use(cors())
        expressServer.set('json spaces', 2)
        expressServer.use(bodyParser.json())
        expressServer.get('/favicon.ico', (req, res) => res.status(204))
        expressServer.use(resolvers)

        /**
         * Catch Not Found Error
         */
        expressServer.use(
            '*',
            hae.express((req, res, next) => {
                throw new createError.NotFound()
            })
        )

        /**
         * Error Handler
         */
        const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
            console.log(error.stack)
            return res.status(error.status || 500).json({error: error.msg || error.message || error})
        }
        expressServer.use(errorHandler)

        /**
         * HTTP server
         */
        const server = http.createServer(expressServer)
        death.register({
            stop: function () {
                server.close()
            },
        })

        return server
    },
}
