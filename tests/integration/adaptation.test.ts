import Controller from '../../src/controller'
import path from 'path'
import * as files from '#files'
import {ServiceTemplate} from '../../src/specification/service-template'
import {Instance} from '../../src/repository/instances'
import {expect} from 'chai'
import {sleep} from '../../src/utils/utils'

const insideWorkflow = process.env.CI === 'true'
const integrationTestsEnabled = insideWorkflow || process.env.ENABLE_INTEGRATION_TESTS === 'true'

if (!integrationTestsEnabled) {
    console.log()
    console.log('Skipping integration tests')
} else {
    describe('adaptation', () => {
        beforeEach(async () => {
            // TODO: set vintner home to not nuke local setups

            // Setup filesystem
            await Controller.setup.clean()
            await Controller.setup.init()

            // Setup xOpera
            if (insideWorkflow) {
                await Controller.orchestrators.initOpera({venv: false, dir: 'none'})
                await Controller.orchestrators.enable({orchestrator: 'opera'})
            } else {
                await Controller.orchestrators.initOperaWSL({venv: true, dir: '~/opera'})
                await Controller.orchestrators.enable({orchestrator: 'opera-wsl'})
            }
        })

        it('adapt', async () => {
            // Import template
            const template = 'opera-getting-started-template'
            const templateDirectory = path.join(__dirname, '..', '..', 'examples', 'opera-getting-started')
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
            const instanceName = 'opera-getting-started-instance'
            const instance = new Instance(instanceName)
            await Controller.instances.create({
                instance: instanceName,
                template,
            })

            // Resolve variability
            await Controller.instances.resolve({
                instance: instanceName,
                inputs: path.join(templateDirectory, 'variability-inputs.example.yaml'),
                first: true,
            })

            // Assert that variability-resolved service template and variability inputs are as expected
            expect(instance.loadServiceTemplate()).to.deep.equal(firstTemplate)
            expect(instance.loadVariabilityInputs()).to.deep.equal({mode: 'first'})

            // Deploy instance
            await Controller.instances.deploy({
                instance: instanceName,
            })

            // TODO: current time precision is not high enough?! throttle monitor (collect for e.g. 5 seconds)

            // Adapt mode from "first" to "second"
            await Controller.instances.adapt({
                instance: instanceName,
                key: 'mode',
                value: 'second',
            })

            // TODO: wait for emit of finished deployment
            await sleep(5 * 1000)

            // Assert that variability-resolved service template and variability inputs are as expected
            expect(instance.loadServiceTemplate()).to.deep.equal(secondTemplate)
            expect(instance.loadVariabilityInputs()).to.deep.equal({mode: 'second'})

            // Adapt mode from "second" to "first"
            // TODO: did not abort when xOpera#deploy threw error
            await Controller.instances.adapt({
                instance: instanceName,
                key: 'mode',
                value: 'first',
            })

            await sleep(5 * 1000)

            // Assert that variability-resolved service template and variability inputs are as expected
            expect(instance.loadServiceTemplate()).to.deep.equal(firstTemplate)
            expect(instance.loadVariabilityInputs()).to.deep.equal({mode: 'first'})

            // Undeploy instance
            await Controller.instances.undeploy({instance: instanceName})
        }).timeout(20 * 1000)

        afterEach(async () => {
            // Cleanup filesystem
            await Controller.setup.clean()
        })
    })
}
