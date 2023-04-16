import Controller from '../../src/controller'
import path from 'path'
import * as files from '#files'
import {ServiceTemplate} from '../../src/specification/service-template'
import {Instance} from '../../src/repository/instances'
import {expect} from 'chai'
import {sleep} from '#utils'
import {before} from 'mocha'
import {checkSetup, cleanSetup, examplesDir, initSetup, integrationTestsEnabled} from './utils'

// TODO: negate this
if (integrationTestsEnabled) {
    console.log()
    console.warn('Skipping integration tests')
} else {
    describe('update-template', () => {
        before(async () => {
            await checkSetup()
        })

        beforeEach(async () => {
            await initSetup()
        })

        it('xopera-test-update-template', async () => {
            // Alpha Template
            const alphaName = 'xopera-test-update-template-alpha'
            const alphaDirectoy = path.join(examplesDir, alphaName)
            const alphaTemplate = files.loadYAML<ServiceTemplate>(
                path.join(alphaDirectoy, 'variable-service-template.yaml')
            )
            await Controller.templates.import({
                template: alphaName,
                path: alphaDirectoy,
            })

            // Bravo Template
            const bravoName = 'xopera-test-update-template-bravo'
            const bravoDirectoy = path.join(examplesDir, bravoName)
            const bravoTemplate = files.loadYAML<ServiceTemplate>(
                path.join(bravoDirectoy, 'variable-service-template.yaml')
            )
            await Controller.templates.import({
                template: bravoName,
                path: bravoDirectoy,
            })

            // Create instance
            const instanceName = 'xopera-test-update-template'
            const instance = new Instance(instanceName)
            await Controller.instances.create({
                instance: instanceName,
                template: alphaName,
            })

            // Expect that initial vst matches alpha
            expect(instance.loadVariableServiceTemplate()).to.deep.equal(alphaTemplate)

            // Check that can be deployed
            await Controller.instances.resolve({instance: instanceName})
            await Controller.instances.deploy({instance: instanceName})

            // Update template
            await Controller.instances.updateTemplate({
                instance: instanceName,
                template: bravoName,
            })

            // Expect that new vst matches bravo
            expect(instance.loadVariableServiceTemplate()).to.deep.equal(bravoTemplate)

            // Check that instance can be updated
            await Controller.instances.resolve({instance: instanceName})
            await Controller.instances.update({instance: instanceName})
        }).timeout(15 * 1000)

        afterEach(async () => {
            await cleanSetup()
        })
    })
}
