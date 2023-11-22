import Controller from '#controller'
import * as files from '#files'
import {Instance} from '#repositories/instances'
import {ServiceTemplate} from '#spec/service-template'
import std from '#std'
import {expect} from 'chai'
import {before} from 'mocha'
import path from 'path'
import {checkSetup, cleanSetup, examplesDir, initSetup, integrationTestsEnabled} from './utils'

if (!integrationTestsEnabled) {
    std.log()
    std.log('Skipping integration tests')
} else {
    describe('swap', () => {
        before(async () => {
            await checkSetup()
        })

        beforeEach(async () => {
            await initSetup()
        })

        it('xopera-test-swap-template', async () => {
            // Alpha Template
            const alphaName = 'xopera-test-swap-template-alpha'
            const alphaDirectoy = path.join(examplesDir, alphaName)
            const alphaTemplate = files.loadYAML<ServiceTemplate>(
                path.join(alphaDirectoy, 'variable-service-template.yaml')
            )
            await Controller.templates.import({
                template: alphaName,
                path: alphaDirectoy,
            })

            // Bravo Template
            const bravoName = 'xopera-test-swap-template-bravo'
            const bravoDirectoy = path.join(examplesDir, bravoName)
            const bravoTemplate = files.loadYAML<ServiceTemplate>(
                path.join(bravoDirectoy, 'variable-service-template.yaml')
            )
            await Controller.templates.import({
                template: bravoName,
                path: bravoDirectoy,
            })

            // Create instance
            const instanceName = 'xopera-test-swap-template'
            const instance = new Instance(instanceName)
            await Controller.instances.init({
                instance: instanceName,
                template: alphaName,
            })

            // Expect that initial vst matches alpha
            expect(instance.loadVariableServiceTemplate()).to.deep.equal(alphaTemplate)

            // Check that can be deployed
            await Controller.instances.resolve({instance: instanceName})
            await Controller.instances.validate({instance: instanceName})
            await Controller.instances.deploy({instance: instanceName})

            // Swap template
            await Controller.instances.swap({
                instance: instanceName,
                template: bravoName,
            })

            // Expect that new vst matches bravo
            expect(instance.loadVariableServiceTemplate()).to.deep.equal(bravoTemplate)

            // Check that instance can be updated
            await Controller.instances.resolve({instance: instanceName})
            await Controller.instances.validate({instance: instanceName})
            await Controller.instances.update({instance: instanceName})
        }).timeout(15 * 1000)

        afterEach(async () => {
            await cleanSetup()
        })
    })
}
