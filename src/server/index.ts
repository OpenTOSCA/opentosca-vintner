import bodyParser from 'body-parser'
import http from 'http'
import express from 'express'
import resolvers from './resolvers'
import type {ErrorRequestHandler} from 'express'
import hae from './hae'
import createError from 'http-errors'
import cors from 'cors'

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
            hae((req, res, next) => {
                throw new createError.NotFound()
            })
        )

        /**
         * Error Handler
         */
        const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
            console.log(error.stack)
            return res.status(error.status || 500).json({error})
        }
        expressServer.use(errorHandler)

        /**
         * HTTP server
         */
        return http.createServer(expressServer)
    },
}
