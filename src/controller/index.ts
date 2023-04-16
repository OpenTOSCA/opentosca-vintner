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
import listTemplates from './templates/list'
import importTemplate from './templates/import'
import inspectTemplate from './templates/inspect'
import deleteTemplate from './templates/delete'
import openTemplate from './templates/open'
import pathTemplate from './templates/path'
import codeTemplate from './templates/code'
import createInstance from './instances/create'
import deployInstance from './instances/deploy'
import inspectInstance from './instances/inspect'
import listInstances from './instances/list'
import openInstance from './instances/open'
import pathInstance from './instances/path'
import codeInstance from './instances/code'
import infoInstance from './instances/info'
import undeployInstance from './instances/undeploy'
import redeployInstance from './instances/redeploy'
import updateInstance from './instances/update'
import deleteInstance from './instances/delete'
import resolveInstance from './instances/resolve'
import adaptInstance from './instances/adapt'
import updateInstanceTemplate from './instances/update-template'
import unadaptInstance from './instances/unadapt'
import runQuery from './query/run'
import benchmarkSetup from './setup/benchmark'
import resolveTemplate from './template/resolve'
import queryTemplate from './template/query'
import testTemplate from './template/test'
import packageTemplate from './template/package'
import unpackageTemplate from './template/unpackage'
import computeSensor from '#controller/sensors/compute'
import locationSensor from '#controller/sensors/location'
import weekdaySensor from '#controller/sensors/weekday'
import fileSensor from '#controller/sensors/file'

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
