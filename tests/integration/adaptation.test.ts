import Controller from '../../src/controller'
import path from 'path'
import * as files from '#files'
import {ServiceTemplate} from '../../src/specification/service-template'
import {Instance} from '../../src/repository/instances'
import {expect} from 'chai'
import {sleep} from '../../src/utils/utils'
import {before} from 'mocha'
import {Shell} from '../../src/utils/shell'

const insideWorkflow = process.env.CI === 'true'
const integrationTestsEnabled = insideWorkflow || process.env.ENABLE_INTEGRATION_TESTS === 'true'

if (!integrationTestsEnabled) {
    console.log()
    console.warn('Skipping integration tests')
} else {
    describe('adaptation', () => {
        before(async () => {
            // Check that xOpera is installed
            if (insideWorkflow) {
                await new Shell().execute(['which opera &>/dev/null'])
            } else {
                await new Shell(true).execute([
                    'cd ~/opera',
                    '&&',
                    '. .venv/bin/activate',
                    '&&',
                    'which opera &>/dev/null',
                ])
            }
        })

        beforeEach(async () => {
            // TODO: set vintner home to not nuke local setups

            // Setup filesystem
            await Controller.setup.clean()
            await Controller.setup.init()

            // Setup xOpera
            if (insideWorkflow) {
                await Controller.orchestrators.initxOpera({venv: false, dir: 'none'})
                await Controller.orchestrators.enable({orchestrator: 'xopera'})
            } else {
                await Controller.orchestrators.initxOperaWSL({venv: true, dir: '~/opera'})
                await Controller.orchestrators.enable({orchestrator: 'xopera-wsl'})
            }
        })

        it('adapt', async () => {
            // Import template
            const template = 'xopera-getting-started-template'
            const templateDirectory = path.join(__dirname, '..', '..', 'examples', 'xopera-getting-started')
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
            await Controller.instances.create({
                instance: instanceName,
                template,
            })

            // Resolve variability
            await Controller.instances.resolve({
                instance: instanceName,
                inputs: path.join(templateDirectory, 'variability-inputs.example.yaml'),
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
            await sleep(5 * 1000)

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
            await sleep(10 * 1000)

            // Assert that variability-resolved service template and variability inputs are as expected
            expect(instance.loadServiceTemplate()).to.deep.equal(firstTemplate)
            expect(instance.loadVariabilityInputs()).to.deep.equal({mode: 'first'})

            // Undeploy instance
            await Controller.instances.undeploy({instance: instanceName})
        }).timeout(60 * 1000)

        afterEach(async () => {
            // Cleanup filesystem
            await Controller.setup.clean()
        })
    })
}
