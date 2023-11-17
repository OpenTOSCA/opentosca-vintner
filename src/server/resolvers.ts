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
        await Controller.setup.clean(req.body)
        res.json({})
    })
)

resolvers.post(
    '/setup/reset',
    hae.express(async (req, res, next) => {
        await Controller.setup.reset(req.body)
        res.json({})
    })
)

resolvers.post(
    '/setup/utils',
    hae.express(async (req, res, next) => {
        await Controller.setup.install(req.body)
        res.json({})
    })
)

resolvers.post(
    '/setup/path',
    hae.express(async (req, res, next) => {
        const path = await Controller.setup.path()
        res.json({path})
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
    '/orchestrators/attest',
    hae.express(async (req, res, next) => {
        await Controller.orchestrators.attest(req.body)
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
    '/template/init',
    hae.express(async (req, res, next) => {
        await Controller.template.init(req.body)
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
    '/template/enrich',
    hae.express(async (req, res, next) => {
        await Controller.template.enrich(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/normalize',
    hae.express(async (req, res, next) => {
        await Controller.template.normalize(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/inputs',
    hae.express(async (req, res, next) => {
        await Controller.template.inputs(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/puml/topology',
    hae.express(async (req, res, next) => {
        await Controller.template.puml.topology(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/puml/types',
    hae.express(async (req, res, next) => {
        await Controller.template.puml.types(req.body)
        res.json({})
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
    '/templates/path',
    hae.express(async (req, res, next) => {
        const path = await Controller.templates.path(req.body)
        res.json({path})
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
    '/instances/path',
    hae.express(async (req, res, next) => {
        const path = await Controller.instances.path(req.body)
        res.json({path})
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
    '/instances/validate',
    hae.express(async (req, res, next) => {
        await Controller.instances.validate(req.body)
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
    '/instances/outputs',
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

resolvers.post(
    '/info/about',
    hae.express(async (req, res, next) => {
        const about = await Controller.info.about()
        res.json({about})
    })
)

resolvers.post(
    '/info/license',
    hae.express(async (req, res, next) => {
        const license = await Controller.info.license()
        res.json({license})
    })
)

resolvers.post(
    '/info/author',
    hae.express(async (req, res, next) => {
        const author = await Controller.info.author()
        res.json({author})
    })
)

resolvers.post(
    '/info/contact',
    hae.express(async (req, res, next) => {
        const docs = await Controller.info.docs()
        res.json({docs})
    })
)

resolvers.post(
    '/info/repo',
    hae.express(async (req, res, next) => {
        const repo = await Controller.info.repo()
        res.json({repo})
    })
)

resolvers.post(
    '/info/dependencies',
    hae.express(async (req, res, next) => {
        const dependencies = await Controller.info.dependencies()
        res.json({dependencies})
    })
)

resolvers.post(
    '/utils/nonce',
    hae.express(async (req, res, next) => {
        const nonce = await Controller.utils.nonce(req.body)
        res.json({nonce})
    })
)

resolvers.post(
    '/utils/key',
    hae.express(async (req, res, next) => {
        await Controller.utils.key(req.body)
        res.json({})
    })
)

resolvers.post(
    '/store/list',
    hae.express(async (req, res, next) => {
        const entries = await Controller.store.list()
        res.json({entries: entries.map(it => it.getName())})
    })
)

resolvers.post(
    '/store/import',
    hae.express(async (req, res, next) => {
        await Controller.store.import(req.body)
        res.json({})
    })
)

resolvers.post(
    '/store/delete',
    hae.express(async (req, res, next) => {
        await Controller.store.delete(req.body)
        res.json({})
    })
)

resolvers.post(
    '/store/clean',
    hae.express(async (req, res, next) => {
        await Controller.store.clean(req.body)
        res.json({})
    })
)

resolvers.post(
    '/store/content',
    hae.express(async (req, res, next) => {
        const content = await Controller.store.content(req.body)
        res.json({content})
    })
)

export default resolvers
