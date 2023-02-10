import enableOrchestrator from './orchestrators/enable'
import initxOpera from './orchestrators/init-xopera'
import initxOperaWSL from './orchestrators/init-xopera-wsl'
import initUnfurl from './orchestrators/init-unfurl'
import initUnfurlWSL from './orchestrators/init-unfurl-wsl'
import startServer from './server/start'
import cleanSetup from './setup/clean'
import initSetup from './setup/init'
import openSetup from './setup/open'
import pathSetup from './setup/path'
import codeSetup from './setup/code'
import resolveTemplate from './template/resolve'
import listTemplates from './templates/list'
import importTemplate from './templates/import'
import inspectTemplate from './templates/inspect'
import deleteTemplate from './templates/delete'
import openTemplate from './templates/open'
import createInstance from './instances/create'
import deployInstance from './instances/deploy'
import inspectInstance from './instances/inspect'
import listInstances from './instances/list'
import openInstance from './instances/open'
import undeployInstance from './instances/undeploy'
import updateInstance from './instances/update'
import deleteInstance from './instances/delete'
import resolveInstance from './instances/resolve'
import adaptInstance from './instances/adapt'
import unadaptInstance from './instances/unadapt'
import runQuery from './query/run'
import benchmarkSetup from './setup/benchmark'
import queryTemplate from './template/query'
import testTemplate from './template/test'

const Controller = {
    instances: {
        create: createInstance,
        delete: deleteInstance,
        deploy: deployInstance,
        inspect: inspectInstance,
        list: listInstances,
        open: openInstance,
        undeploy: undeployInstance,
        update: updateInstance,
        resolve: resolveInstance,
        adapt: adaptInstance,
        unadapt: unadaptInstance,
    },
    query: {
        run: runQuery,
    },
    orchestrators: {
        enable: enableOrchestrator,
        initxOpera: initxOpera,
        initxOperaWSL: initxOperaWSL,
        initUnfurl: initUnfurl,
        initUnfurlWSL: initUnfurlWSL,
    },
    server: {
        start: startServer,
    },
    setup: {
        clean: cleanSetup,
        init: initSetup,
        open: openSetup,
        benchmark: benchmarkSetup,
        path: pathSetup,
        code: codeSetup,
    },
    template: {
        resolve: resolveTemplate,
        query: queryTemplate,
        test: testTemplate,
    },
    templates: {
        delete: deleteTemplate,
        import: importTemplate,
        inspect: inspectTemplate,
        list: listTemplates,
        open: openTemplate,
    },
}

export default Controller
