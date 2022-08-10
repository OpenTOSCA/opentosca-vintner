import enableOrchestrator from './orchestrators/enable'
import initOpera from './orchestrators/init-opera'
import initOperaWSL from './orchestrators/init-opera-wsl'
import initUnfurl from './orchestrators/init-unfurl'
import initUnfurlWSL from './orchestrators/init-unfurl-wsl'
import startServer from './server/start'
import cleanSetup from './setup/clean'
import initSetup from './setup/init'
import openHome from './setup/openHome'
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
    },
    orchestrators: {
        enable: enableOrchestrator,
        initOpera: initOpera,
        initOperaWSL: initOperaWSL,
        initUnfurl: initUnfurl,
        initUnfurlWSL: initUnfurlWSL,
    },
    server: {
        start: startServer,
    },
    setup: {
        clean: cleanSetup,
        init: initSetup,
        open: openHome,
    },
    template: {
        resolve: resolveTemplate,
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
