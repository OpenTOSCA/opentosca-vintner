import * as express from 'express'
import hae from './hae'
import Controller from '#controller'
import adapt from '#controller/instances/adapt'

const resolvers = express.Router()

resolvers.post(
    '/setup/init',
    hae(async (req, res, next) => {
        await Controller.setup.init()
        res.json({})
    })
)

resolvers.post(
    '/setup/clean',
    hae(async (req, res, next) => {
        await Controller.setup.clean()
        res.json({})
    })
)

resolvers.post(
    '/orchestrators/enable',
    hae(async (req, res, next) => {
        await Controller.orchestrators.enable(req.body)
        res.json({})
    })
)

resolvers.post(
    '/orchestrators/init/xopera',
    hae(async (req, res, next) => {
        await Controller.orchestrators.initxOpera(req.body)
        res.json({})
    })
)

resolvers.post(
    '/orchestrators/init/xopera-wsl',
    hae(async (req, res, next) => {
        await Controller.orchestrators.initxOperaWSL(req.body)
        res.json({})
    })
)

resolvers.post(
    '/orchestrators/init/unfurl',
    hae(async (req, res, next) => {
        await Controller.orchestrators.initUnfurl(req.body)
        res.json({})
    })
)

resolvers.post(
    '/orchestrators/init/unfurl-wsl',
    hae(async (req, res, next) => {
        await Controller.orchestrators.initUnfurlWSL(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/resolve',
    hae(async (req, res, next) => {
        await Controller.template.resolve(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/query',
    hae(async (req, res, next) => {
        await Controller.template.query(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/test',
    hae(async (req, res, next) => {
        await Controller.template.test(req.body)
        res.json({})
    })
)

resolvers.post(
    '/templates/list',
    hae(async (req, res, next) => {
        const list = await Controller.templates.list()
        res.json({list: list.map(template => template.getName())})
    })
)

resolvers.post(
    '/templates/import',
    hae(async (req, res, next) => {
        await Controller.templates.import(req.body)
        res.json({})
    })
)

resolvers.post(
    '/templates/inspect',
    hae(async (req, res, next) => {
        const template = await Controller.templates.inspect(req.body)
        res.json({template})
    })
)

resolvers.post(
    '/templates/delete',
    hae(async (req, res, next) => {
        await Controller.templates.delete(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/list',
    hae(async (req, res, next) => {
        const instances = await Controller.instances.list()
        res.json({list: instances.map(instance => instance.getName()).join('\n')})
    })
)

resolvers.post(
    '/instances/create',
    hae(async (req, res, next) => {
        await Controller.instances.create(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/resolve',
    hae(async (req, res, next) => {
        await Controller.template.resolve(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/deploy',
    hae(async (req, res, next) => {
        await Controller.instances.undeploy(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/update',
    hae(async (req, res, next) => {
        await Controller.instances.update(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/undeploy',
    hae(async (req, res, next) => {
        await Controller.instances.undeploy(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/delete',
    hae(async (req, res, next) => {
        await Controller.instances.delete(req.body)
        res.json({})
    })
)

resolvers.post(
    '/query/run',
    hae(async (req, res, next) => {
        const result = await Controller.query.run(req.body)
        res.json(result)
    })
)

resolvers.post(
    '/instances/adapt',
    hae(async (req, res, next) => {
        await Controller.instances.adapt(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/unadapt',
    hae(async (req, res, next) => {
        await Controller.instances.unadapt(req.body)
        res.json({})
    })
)

export default resolvers
