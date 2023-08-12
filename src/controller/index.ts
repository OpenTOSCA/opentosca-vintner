import computeSensor from '#controller/sensors/compute'
import fileSensor from '#controller/sensors/file'
import locationSensor from '#controller/sensors/location'
import weekdaySensor from '#controller/sensors/weekday'
import aboutInfo from './info/about'
import authorInfo from './info/author'
import contactInfo from './info/contact'
import dependenciesInfo from './info/dependencies'
import docsInfo from './info/docs'
import licenseInfo from './info/license'
import repoInfo from './info/repo'
import adaptInstance from './instances/adapt'
import cleanInstances from './instances/clean'
import codeInstance from './instances/code'
import continueInstance from './instances/continue'
import deleteInstance from './instances/delete'
import deployInstance from './instances/deploy'
import infoInstance from './instances/info'
import initInstance from './instances/init'
import inspectInstance from './instances/inspect'
import listInstances from './instances/list'
import openInstance from './instances/open'
import pathInstance from './instances/path'
import resolveInstance from './instances/resolve'
import swapInstance from './instances/swap'
import unadaptInstance from './instances/unadapt'
import undeployInstance from './instances/undeploy'
import updateInstance from './instances/update'
import enableOrchestrator from './orchestrators/enable'
import initUnfurl from './orchestrators/init-unfurl'
import initUnfurlWSL from './orchestrators/init-unfurl-wsl'
import initxOpera from './orchestrators/init-xopera'
import initxOperaWSL from './orchestrators/init-xopera-wsl'
import runQuery from './query/run'
import startServer from './server/start'
import benchmarkSetup from './setup/benchmark'
import cleanSetup from './setup/clean'
import codeSetup from './setup/code'
import initSetup from './setup/init'
import openSetup from './setup/open'
import pathSetup from './setup/path'
import utilsSetup from './setup/utils'
import initTemplate from './template/init'
import inputsTemplate from './template/inputs'
import packageTemplate from './template/package'
import pumlTopologyTemplate from './template/puml/topology'
import pumlTypesTemplate from './template/puml/types'
import queryTemplate from './template/query'
import resolveTemplate from './template/resolve'
import statsTemplate from './template/stats'
import testTemplate from './template/test'
import unpackageTemplate from './template/unpackage'
import cleanTemplates from './templates/clean'
import codeTemplate from './templates/code'
import deleteTemplate from './templates/delete'
import importTemplate from './templates/import'
import inspectTemplate from './templates/inspect'
import listTemplates from './templates/list'
import openTemplate from './templates/open'
import pathTemplate from './templates/path'

const Controller = {
    info: {
        contact: contactInfo,
        docs: docsInfo,
        about: aboutInfo,
        license: licenseInfo,
        repo: repoInfo,
        dependencies: dependenciesInfo,
        author: authorInfo,
    },
    instances: {
        init: initInstance,
        delete: deleteInstance,
        deploy: deployInstance,
        inspect: inspectInstance,
        list: listInstances,
        open: openInstance,
        code: codeInstance,
        path: pathInstance,
        undeploy: undeployInstance,
        continue: continueInstance,
        update: updateInstance,
        resolve: resolveInstance,
        adapt: adaptInstance,
        unadapt: unadaptInstance,
        swap: swapInstance,
        info: infoInstance,
        clean: cleanInstances,
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
        utils: utilsSetup,
    },
    template: {
        init: initTemplate,
        package: packageTemplate,
        unpackage: unpackageTemplate,
        resolve: resolveTemplate,
        query: queryTemplate,
        test: testTemplate,
        inputs: inputsTemplate,
        stats: statsTemplate,
        puml: {
            topology: pumlTopologyTemplate,
            types: pumlTypesTemplate,
        },
    },
    templates: {
        delete: deleteTemplate,
        import: importTemplate,
        inspect: inspectTemplate,
        list: listTemplates,
        open: openTemplate,
        code: codeTemplate,
        path: pathTemplate,
        clean: cleanTemplates,
    },
    sensors: {
        compute: computeSensor,
        location: locationSensor,
        weekday: weekdaySensor,
        file: fileSensor,
    },
}

export default Controller
