import Controller from '#controller'
import hae from '#utils/hae'
import * as express from 'express'

const resolvers = express.Router()

resolvers.post(
    '/setup/init',
    hae.express(async (req, res, next) => {
        await Controller.setup.init()
        res.json({})
    })
)

resolvers.post(
    '/setup/clean',
    hae.express(async (req, res, next) => {
        await Controller.setup.clean()
        res.json({})
    })
)

resolvers.post(
    '/orchestrators/enable',
    hae.express(async (req, res, next) => {
        await Controller.orchestrators.enable(req.body)
        res.json({})
    })
)

resolvers.post(
    '/orchestrators/init/xopera',
    hae.express(async (req, res, next) => {
        await Controller.orchestrators.initxOpera(req.body)
        res.json({})
    })
)

resolvers.post(
    '/orchestrators/init/xopera-wsl',
    hae.express(async (req, res, next) => {
        await Controller.orchestrators.initxOperaWSL(req.body)
        res.json({})
    })
)

resolvers.post(
    '/orchestrators/init/unfurl',
    hae.express(async (req, res, next) => {
        await Controller.orchestrators.initUnfurl(req.body)
        res.json({})
    })
)

resolvers.post(
    '/orchestrators/init/unfurl-wsl',
    hae.express(async (req, res, next) => {
        await Controller.orchestrators.initUnfurlWSL(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/resolve',
    hae.express(async (req, res, next) => {
        await Controller.template.resolve(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/query',
    hae.express(async (req, res, next) => {
        await Controller.template.query(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/stats',
    hae.express(async (req, res, next) => {
        const stats = await Controller.template.stats(req.body)
        res.json({stats})
    })
)

resolvers.post(
    '/template/test',
    hae.express(async (req, res, next) => {
        await Controller.template.test(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/inputs',
    hae.express(async (req, res, next) => {
        await Controller.template.inputs(req.body)
    })
)

resolvers.post(
    '/template/puml/topology',
    hae.express(async (req, res, next) => {
        await Controller.template.puml.topology(req.body)
    })
)

resolvers.post(
    '/template/puml/types',
    hae.express(async (req, res, next) => {
        await Controller.template.puml.types(req.body)
    })
)

resolvers.post(
    '/templates/list',
    hae.express(async (req, res, next) => {
        const list = await Controller.templates.list()
        res.json({list: list.map(template => template.getName())})
    })
)

resolvers.post(
    '/templates/import',
    hae.express(async (req, res, next) => {
        await Controller.templates.import(req.body)
        res.json({})
    })
)

resolvers.post(
    '/templates/inspect',
    hae.express(async (req, res, next) => {
        const template = await Controller.templates.inspect(req.body)
        res.json({template})
    })
)

resolvers.post(
    '/templates/delete',
    hae.express(async (req, res, next) => {
        await Controller.templates.delete(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/list',
    hae.express(async (req, res, next) => {
        const instances = await Controller.instances.list()
        res.json({list: instances.map(instance => instance.getName()).join('\n')})
    })
)

resolvers.post(
    '/instances/init',
    hae.express(async (req, res, next) => {
        await Controller.instances.init(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/resolve',
    hae.express(async (req, res, next) => {
        await Controller.instances.resolve(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/deploy',
    hae.express(async (req, res, next) => {
        await Controller.instances.undeploy(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/continue',
    hae.express(async (req, res, next) => {
        await Controller.instances.undeploy(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/undeploy',
    hae.express(async (req, res, next) => {
        await Controller.instances.undeploy(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/delete',
    hae.express(async (req, res, next) => {
        await Controller.instances.delete(req.body)
        res.json({})
    })
)

resolvers.post(
    '/query/run',
    hae.express(async (req, res, next) => {
        const result = await Controller.query.run(req.body)
        res.json(result)
    })
)

resolvers.post(
    '/instances/adapt',
    hae.express(async (req, res, next) => {
        await Controller.instances.adapt(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/unadapt',
    hae.express(async (req, res, next) => {
        await Controller.instances.unadapt(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/update',
    hae.express(async (req, res, next) => {
        await Controller.instances.update(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/swap',
    hae.express(async (req, res, next) => {
        await Controller.instances.swap(req.body)
        res.json({})
    })
)

resolvers.post(
    '/instances/info',
    hae.express(async (req, res, next) => {
        const info = await Controller.instances.info(req.body)
        res.json(info)
    })
)

export default resolvers
