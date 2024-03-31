import Controller from '#controller'
import {benchmark2latex, benchmark2markdown} from '#controller/setup/benchmark'
import hae from '#utils/hae'
import * as express from 'express'

const resolvers = express.Router()

/**
 * Setup
 */

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
    '/setup/path',
    hae.express(async (req, res, next) => {
        const path = await Controller.setup.path()
        res.json({path})
    })
)

resolvers.post(
    '/setup/benchmark',
    hae.express(async (req, res, next) => {
        const benchmark = await Controller.setup.benchmark(req.body)
        res.json({
            benchmark,
            markdown: req.body.markdown ? benchmark2markdown(benchmark, req.body) : undefined,
            latex: benchmark2latex(benchmark, req.body),
        })
    })
)

/**
 * Info
 */

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
        const contact = await Controller.info.contact()
        res.json({contact})
    })
)

resolvers.post(
    '/info/docs',
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

/**
 * Install
 */

resolvers.post(
    '/install/ansible',
    hae.express(async (req, res, next) => {
        await Controller.install.ansible(req.body)
        res.json({})
    })
)

resolvers.post(
    '/install/gcloud',
    hae.express(async (req, res, next) => {
        await Controller.install.gcloud(req.body)
        res.json({})
    })
)

resolvers.post(
    '/install/python',
    hae.express(async (req, res, next) => {
        await Controller.install.python(req.body)
        res.json({})
    })
)

resolvers.post(
    '/install/terraform',
    hae.express(async (req, res, next) => {
        await Controller.install.terraform(req.body)
        res.json({})
    })
)

resolvers.post(
    '/install/unfurl',
    hae.express(async (req, res, next) => {
        await Controller.install.unfurl(req.body)
        res.json({})
    })
)

resolvers.post(
    '/install/utils',
    hae.express(async (req, res, next) => {
        await Controller.install.utils(req.body)
        res.json({})
    })
)

resolvers.post(
    '/install/xopera',
    hae.express(async (req, res, next) => {
        await Controller.install.xopera(req.body)
        res.json({})
    })
)

/**
 * Orchestrators
 */

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

/**
 * Template
 */

resolvers.post(
    '/template/init',
    hae.express(async (req, res, next) => {
        await Controller.template.init(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/package',
    hae.express(async (req, res, next) => {
        await Controller.template.package(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/unpackage',
    hae.express(async (req, res, next) => {
        await Controller.template.unpackage(req.body)
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
        res.json({})
    })
)

resolvers.post(
    '/template/sign',
    hae.express(async (req, res, next) => {
        await Controller.template.sign(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/verify',
    hae.express(async (req, res, next) => {
        await Controller.template.verify(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/pull',
    hae.express(async (req, res, next) => {
        await Controller.template.pull(req.body)
        res.json({})
    })
)

resolvers.post(
    '/template/unpull',
    hae.express(async (req, res, next) => {
        await Controller.template.unpull(req.body)
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

/**
 * Templates
 */

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
    '/templates/clean',
    hae.express(async (req, res, next) => {
        await Controller.templates.clean(req.body)
        res.json({})
    })
)

/**
 * Instances
 */

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
    '/instances/info',
    hae.express(async (req, res, next) => {
        const info = await Controller.instances.info(req.body)
        res.json({info})
    })
)

resolvers.post(
    '/instances/inspect',
    hae.express(async (req, res, next) => {
        const template = await Controller.instances.inspect(req.body)
        res.json({template})
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
    '/instances/clean',
    hae.express(async (req, res, next) => {
        await Controller.instances.clean(req.body)
        res.json({})
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

/**
 * Assets
 */

resolvers.post(
    '/assets/list',
    hae.express(async (req, res, next) => {
        const assets = await Controller.assets.list()
        res.json({assets: assets.map(it => it.getName())})
    })
)

resolvers.post(
    '/assets/import',
    hae.express(async (req, res, next) => {
        await Controller.assets.import(req.body)
        res.json({})
    })
)

resolvers.post(
    '/assets/content',
    hae.express(async (req, res, next) => {
        const content = await Controller.assets.content(req.body)
        res.json({content})
    })
)

resolvers.post(
    '/assets/delete',
    hae.express(async (req, res, next) => {
        await Controller.assets.delete(req.body)
        res.json({})
    })
)

resolvers.post(
    '/assets/clean',
    hae.express(async (req, res, next) => {
        await Controller.assets.clean(req.body)
        res.json({})
    })
)

/**
 * Utils
 */

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

/**
 * Query
 */

resolvers.post(
    '/query/run',
    hae.express(async (req, res, next) => {
        const result = await Controller.query.run(req.body)
        res.json(result)
    })
)

export default resolvers
