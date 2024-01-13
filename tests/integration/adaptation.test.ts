import * as files from '#files'
import {Instance} from '#repositories/instances'
import {ServiceTemplate} from '#spec/service-template'
import std from '#std'
import * as utils from '#utils'
import {expect} from 'chai'
import path from 'path'
import Controller from '../../src/controller'
import {cleanSetup, examplesDir, initSetup, integrationTestsEnabled} from './utils'

if (!integrationTestsEnabled) {
    std.log()
    std.log('Skipping integration tests')
} else {
    describe('adaptation', () => {
        beforeEach(async () => {
            await initSetup()
        })

        it('xopera-getting-started', async () => {
            // Import template
            const template = 'xopera-getting-started-template'
            const templateDirectory = path.join(examplesDir, 'xopera-getting-started')
            const firstTemplate = files.loadYAML<ServiceTemplate>(
                path.join(templateDirectory, 'tests', 'first', 'expected.yaml')
            )
            const secondTemplate = files.loadYAML<ServiceTemplate>(
                path.join(templateDirectory, 'tests', 'second', 'expected.yaml')
            )

            await Controller.templates.import({
                template,
                path: templateDirectory,
            })

            // Create instance
            const instanceName = 'xopera-getting-started-instance'
            const instance = new Instance(instanceName)
            await Controller.instances.init({
                instance: instanceName,
                template,
            })

            // Resolve variability
            await Controller.instances.resolve({
                instance: instanceName,
                presets: ['first'],
            })

            // Assert that variability-resolved service template and variability inputs are as expected
            expect(instance.loadServiceTemplate()).to.deep.equal(firstTemplate)
            expect(instance.loadVariabilityInputs()).to.deep.equal({mode: 'first'})

            // Deploy instance
            await Controller.instances.deploy({
                instance: instanceName,
            })

            // Adapt mode from "first" to "second"
            await Controller.instances.adapt({
                instance: instanceName,
                inputs: {mode: 'second'},
            })

            // Wait until adaptation finished
            await utils.sleep(5 * 1000)

            // Assert that variability-resolved service template and variability inputs are as expected
            expect(instance.loadServiceTemplate()).to.deep.equal(secondTemplate)
            expect(instance.loadVariabilityInputs()).to.deep.equal({mode: 'second'})

            // Adapt mode from "second" to "first"
            for (const value of ['third', 'fourth', 'fifth', 'sixth', 'first']) {
                const _ = Controller.instances.adapt({
                    instance: instanceName,
                    inputs: {mode: value},
                })
            }

            // Wait until everything is adapted
            await utils.sleep(10 * 1000)

            // Assert that variability-resolved service template and variability inputs are as expected
            expect(instance.loadServiceTemplate()).to.deep.equal(firstTemplate)
            expect(instance.loadVariabilityInputs()).to.deep.equal({mode: 'first'})

            // Undeploy instance
            await Controller.instances.undeploy({instance: instanceName})
        }).timeout(60 * 1000)

        afterEach(async () => {
            await cleanSetup()
        })
    })
}
