import * as check from '#check'
import std from '#std'
import death from '#utils/death'
import hae from '#utils/hae'
import bodyParser from 'body-parser'
import cors from 'cors'
import express, {ErrorRequestHandler, Express} from 'express'
import http from 'http'
import createError from 'http-errors'
import resolvers from './resolvers'

class Server {
    private express?: Express
    private http?: http.Server

    create() {
        /**
         * Express Server
         */
        this.express = express()
        this.express.use(cors())
        this.express.set('json spaces', 2)
        this.express.use(bodyParser.json())
        this.express.get('/favicon.ico', (req, res) => res.status(204))
        this.express.use(resolvers)

        /**
         * Catch Not Found Error
         */
        this.express.use(
            '*',
            hae.express((req, res, next) => {
                throw new createError.NotFound()
            })
        )

        /**
         * Error Handler
         */
        const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
            std.log(error.stack)
            return res.status(error.status || 500).json({error: error.msg || error.message || error})
        }
        this.express.use(errorHandler)

        /**
         * HTTP server
         */
        this.http = http.createServer(this.express)

        /**
         * Death
         */
        death.register(this)

        return this.http
    }

    stop() {
        if (check.isDefined(this.http)) {
            return new Promise<void>((resolve, reject) => {
                this.http!.close(error => {
                    if (check.isDefined(error)) return reject(error)
                    return resolve()
                })
            })
        }
    }
}

export default new Server()
