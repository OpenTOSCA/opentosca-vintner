import computeSensor from '#controller/sensors/compute'
import fileSensor from '#controller/sensors/file'
import locationSensor from '#controller/sensors/location'
import weekdaySensor from '#controller/sensors/weekday'
import adaptInstance from './instances/adapt'
import codeInstance from './instances/code'
import createInstance from './instances/create'
import deleteInstance from './instances/delete'
import deployInstance from './instances/deploy'
import infoInstance from './instances/info'
import inspectInstance from './instances/inspect'
import listInstances from './instances/list'
import openInstance from './instances/open'
import pathInstance from './instances/path'
import redeployInstance from './instances/redeploy'
import resolveInstance from './instances/resolve'
import unadaptInstance from './instances/unadapt'
import undeployInstance from './instances/undeploy'
import updateInstance from './instances/update'
import updateInstanceTemplate from './instances/update-template'
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
import inputsTemplate from './template/inputs'
import packageTemplate from './template/package'
import queryTemplate from './template/query'
import resolveTemplate from './template/resolve'
import testTemplate from './template/test'
import unpackageTemplate from './template/unpackage'
import codeTemplate from './templates/code'
import deleteTemplate from './templates/delete'
import importTemplate from './templates/import'
import inspectTemplate from './templates/inspect'
import listTemplates from './templates/list'
import openTemplate from './templates/open'
import pathTemplate from './templates/path'

const Controller = {
    instances: {
        create: createInstance,
        delete: deleteInstance,
        deploy: deployInstance,
        inspect: inspectInstance,
        list: listInstances,
        open: openInstance,
        code: codeInstance,
        path: pathInstance,
        undeploy: undeployInstance,
        redeploy: redeployInstance,
        update: updateInstance,
        resolve: resolveInstance,
        adapt: adaptInstance,
        unadapt: unadaptInstance,
        updateTemplate: updateInstanceTemplate,
        info: infoInstance,
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
        package: packageTemplate,
        unpackage: unpackageTemplate,
        resolve: resolveTemplate,
        query: queryTemplate,
        test: testTemplate,
        inputs: inputsTemplate,
    },
    templates: {
        delete: deleteTemplate,
        import: importTemplate,
        inspect: inspectTemplate,
        list: listTemplates,
        open: openTemplate,
        code: codeTemplate,
        path: pathTemplate,
    },
    sensors: {
        compute: computeSensor,
        location: locationSensor,
        weekday: weekdaySensor,
        file: fileSensor,
    },
}

export default Controller
