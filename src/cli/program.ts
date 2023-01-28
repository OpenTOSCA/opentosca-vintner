import {Command, Option} from 'commander'
import hae from './hae'
import config from '#config'
import Controller from '#controller'
import * as files from '#files'
import benchmark, {benchmark2latex, benchmark2markdown} from '#controller/setup/benchmark'
import console from 'console'

export const program = new Command()

program.name('vintner').version(config.version)

const setup = program.command('setup').description('setups the filesystem')

setup
    .command('init')
    .description('initialises the filesystem')
    .action(
        hae(async () => {
            await Controller.setup.init()
        })
    )

setup
    .command('clean')
    .description('cleans up the filesystem')
    .action(
        hae(async () => {
            await Controller.setup.clean()
        })
    )

setup
    .command('open')
    .description('opens the home directory')
    .action(
        hae(async () => {
            await Controller.setup.open()
        })
    )

setup
    .command('benchmark')
    .description('benchmarks the variability resolver')
    .option('--no-io [boolean]', 'disable read and writes to the filesystem')
    .addOption(
        new Option('--seeds [numbers...]', 'seed for generating service templates').default([
            10, 250, 500, 1000, 2500, 5000, 10000,
        ])
    )
    .addOption(new Option('--runs [number]', 'number of measurements for each test').default(10))
    .option('--latex [boolean]', 'plot results as latex', false)
    .option('--markdown [boolean]', 'plot results as markdown', false)
    .action(
        hae(async options => {
            const results = await Controller.setup.benchmark(options)
            console.table(results)
            if (options.markdown) console.log('\n', benchmark2markdown(results))
            if (options.latex) console.log('\n', benchmark2latex(results, options))
        })
    )

const orchestrators = program.command('orchestrators').description('configures orchestrators')

orchestrators
    .command('enable')
    .description('enables an orchestrator plugin')
    .requiredOption('--orchestrator <string>', 'orchestrator plugin')
    .action(
        hae(async options => {
            await Controller.orchestrators.enable(options)
        })
    )

const initOrchestrators = orchestrators.command('init').description('initializes an orchestrator plugin')

initOrchestrators
    .command('opera')
    .description('initializes opera plugin')
    .option('--venv [boolean]', 'enable the use of a virtual environment', true)
    .option('--dir [string]', 'directory of opera', '~/opera')
    .action(
        hae(async options => {
            await Controller.orchestrators.initOpera(options)
        })
    )

initOrchestrators
    .command('opera-wsl')
    .description('initializes opera-wsl plugin')
    .option('--venv [boolean]', 'enable the use of a virtual environment', true)
    .option('--dir [string]', 'directory of opera', '~/opera')
    .action(
        hae(async options => {
            await Controller.orchestrators.initOperaWSL(options)
        })
    )

initOrchestrators
    .command('unfurl')
    .description('initializes unfurl plugin')
    .option('--venv [boolean]', 'enable the use of a virtual environment', true)
    .option('--dir [string]', 'directory of unfurl', '~/.unfurl_home')
    .action(
        hae(async options => {
            await Controller.orchestrators.initUnfurl(options)
        })
    )

initOrchestrators
    .command('unfurl-wsl')
    .description('initializes unfurl-wsl plugin')
    .option('--venv [boolean]', 'enable the use of a virtual environment', true)
    .option('--dir [string]', 'directory of unfurl', '~/.unfurl_home')
    .action(
        hae(async options => {
            await Controller.orchestrators.initUnfurlWSL(options)
        })
    )

program
    .command('query')
    .description('runs a query and returns the result')
    .requiredOption('--query <string>', 'path to query or query string')
    .option('--source [string]', 'specifies where to search for template to query', 'vintner')
    .option('--output [string]', 'path of the output')
    .addOption(new Option('--format [string]', 'output format').default('yaml').choices(['yaml', 'json']))
    .action(
        hae(async options => {
            const result = await Controller.query.run(options)
            if (options.format === 'yaml') console.log(files.toYAML(result))
            if (options.format === 'json') console.log(files.toJSON(result))
        })
    )

const template = program.command('template').description('handles stand-alone variable service templates')

template
    .command('resolve')
    .description('resolves variability')
    .requiredOption('--template <string>', 'path to variable service template')
    .option('--preset [string]', 'name of the variability preset')
    .option('--inputs [string]', 'path to the variability inputs (supported: [YAML, FeatureIDE ExtendedXML])')
    .requiredOption('--output <string>', 'path of the output')
    .option(
        '--enable-relation-default-condition [boolean]',
        'enable default condition for relations that checks is the source is present'
    )
    .option(
        '--enable-policy-default-condition [boolean]',
        'enable default condition for policies that checks if no target is present'
    )
    .option(
        '--enable-group-default-condition [boolean]',
        'enable default condition for groups that checks if no member is present'
    )
    .option(
        '--enable-artifact-default-condition [boolean]',
        'enable default condition for artifacts that checks if corresponding node is present'
    )
    .option(
        '--enable-property-default-condition [boolean]',
        'enable default condition for properties that checks if corresponding node or relation is present'
    )
    .option('--disable-consistency-checks [boolean]', 'disable all consistency checks')
    .option(
        '--disable-relation-source-consistency-check [boolean]',
        'disable consistency check regarding relation sources'
    )
    .option(
        '--disable-relation-target-consistency-check [boolean]',
        'disable consistency check regarding relation targets'
    )
    .option(
        '--disable-ambiguous-hosting-consistency-check [boolean]',
        'disable consistency check regarding maximum one hosting relation'
    )
    .option(
        '--disable-expected-hosting-consistency-check [boolean]',
        'disable consistency check regarding expected hosting relation'
    )
    .option(
        '--disable-missing-artifact-parent-consistency-check [boolean]',
        'disable consistency check regarding node of artifact'
    )
    .option(
        '--disable-ambiguous-artifact-consistency-check [boolean]',
        'disable consistency check regarding ambiguous artifacts'
    )
    .option(
        '--disable-missing-property-parent-consistency-check [boolean]',
        'disable consistency check regarding node of a property'
    )
    .option(
        '--disable-ambiguous-property-consistency-check [boolean]',
        'disable consistency check regarding ambiguous properties'
    )
    .action(
        hae(async options => {
            await Controller.template.resolve(options)
        })
    )

template
    .command('query')
    .description('resolves all queries in a given service template')
    .requiredOption('--template <string>', 'path to service template')
    .requiredOption('--output <string>', 'path of the output')
    .action(
        hae(async options => {
            Controller.template.query(options)
        })
    )

template
    .command('test')
    .description('runs tests defined in the CSAR')
    .requiredOption('--path <string>', 'path or link to the extracted CSAR')
    .action(
        hae(async options => {
            await Controller.template.test(options)
        })
    )

const templates = program.command('templates').description('handles templates repository')

templates
    .command('list')
    .description('lists all templates')
    .action(
        hae(async () => {
            const templates = await Controller.templates.list()
            console.log(templates.map(template => template.getName()).join('\n'))
        })
    )

templates
    .command('import')
    .description('imports a new template')
    .requiredOption('--template <string>', 'template name')
    .requiredOption('--path <string>', 'path or link to the csar')
    .action(
        hae(async options => {
            await Controller.templates.import(options)
        })
    )

templates
    .command('open')
    .description('opens template directory in a file browser')
    .requiredOption('--template <string>', 'template name')
    .action(
        hae(async options => {
            await Controller.templates.open(options)
        })
    )

templates
    .command('inspect')
    .description('inspects the variable service template')
    .requiredOption('--template <string>', 'template name')
    .action(
        hae(async options => {
            const template = await Controller.templates.inspect(options)
            console.log(files.toYAML(template))
        })
    )

templates
    .command('delete')
    .description('deletes a template')
    .requiredOption('--template <string>', 'template name')
    .action(
        hae(async options => {
            await Controller.templates.delete(options)
        })
    )

const instances = program.command('instances').description('handles instances')

instances
    .command('list')
    .description('lists all instances')
    .action(
        hae(async () => {
            const instances = await Controller.instances.list()
            console.log(instances.map(instance => instance.getName()).join('\n'))
        })
    )

instances
    .command('create')
    .description('creates a new instance')
    .requiredOption('--instance <string>', 'instance name')
    .requiredOption('--template <string>', 'template name')
    .action(
        hae(async options => {
            await Controller.instances.create(options)
        })
    )

instances
    .command('open')
    .description('opens template directory in a file browser')
    .requiredOption('--instance <string>', 'instance name')
    .action(
        hae(async options => {
            await Controller.instances.open(options)
        })
    )

instances
    .command('resolve')
    .description('resolves variability')
    .requiredOption('--instance <string>', 'instance name')
    .option('--preset [string]', 'name of the variability preset')
    .option('--inputs [string]', 'path to the variability inputs (supported: [YAML, FeatureIDE ExtendedXML])')
    .option(
        '--enable-relation-default-condition [boolean]',
        'enable default condition for relations that checks is the source is present'
    )
    .option(
        '--enable-policy-default-condition [boolean]',
        'enable default condition for policies that checks if no target is present'
    )
    .option(
        '--enable-group-default-condition [boolean]',
        'enable default condition for groups that checks if no member is present'
    )
    .option(
        '--enable-artifact-default-condition [boolean]',
        'enable default condition for artifacts that checks if corresponding node is present'
    )
    .option(
        '--enable-property-default-condition [boolean]',
        'enable default condition for properties that checks if corresponding node or relation is present'
    )
    .option('--disable-consistency-checks [boolean]', 'disable all consistency checks')
    .option(
        '--disable-relation-source-consistency-check [boolean]',
        'disable consistency check regarding relation sources'
    )
    .option(
        '--disable-relation-target-consistency-check [boolean]',
        'disable consistency check regarding relation targets'
    )
    .option(
        '--disable-ambiguous-hosting-consistency-check [boolean]',
        'disable consistency check regarding maximum one hosting relation'
    )
    .option(
        '--disable-expected-hosting-consistency-check [boolean]',
        'disable consistency check regarding expected hosting relation'
    )
    .option(
        '--disable-missing-artifact-parent-consistency-check [boolean]',
        'disable consistency check regarding node of artifact'
    )
    .option(
        '--disable-ambiguous-artifact-consistency-check [boolean]',
        'disable consistency check regarding ambiguous artifacts'
    )
    .option(
        '--disable-missing-property-parent-consistency-check [boolean]',
        'disable consistency check regarding node of a property'
    )
    .option(
        '--disable-ambiguous-property-consistency-check [boolean]',
        'disable consistency check regarding ambiguous properties'
    )
    .action(
        hae(async options => {
            await Controller.template.resolve(options)
        })
    )

instances
    .command('inspect')
    .description('inspects variability-resolved service template')
    .requiredOption('--instance <string>', 'instance name')
    .action(
        hae(async options => {
            const template = await Controller.instances.inspect(options)
            console.log(files.toYAML(template))
        })
    )

instances
    .command('deploy')
    .description('deploys instance')
    .requiredOption('--instance <string>', 'instance name')
    .option('--inputs [string]', 'path to the deployment inputs')
    .action(
        hae(async options => {
            await Controller.instances.deploy(options)
        })
    )

instances
    .command('update')
    .description('updates instance')
    .requiredOption('--instance <string>', 'instance name')
    .option('--inputs [string]', 'path to the deployment inputs')
    .action(
        hae(async options => {
            await Controller.instances.update(options)
        })
    )

instances
    .command('undeploy')
    .description('undeploys instance')
    .requiredOption('--instance <string>', 'instance name')
    .action(
        hae(async options => {
            await Controller.instances.undeploy(options)
        })
    )

instances
    .command('delete')
    .description('deletes instance')
    .requiredOption('--instance <string>', 'instance name')
    .action(
        hae(async options => {
            await Controller.instances.delete(options)
        })
    )

const server = program.command('server').description('handles the server')

server
    .command('start')
    .description('starts the server')
    .option('--host [string]', 'host on which to listen', '127.0.0.1')
    .option('--port [number}', 'port on which to listen', '3000')
    .action(
        hae(async options => {
            await Controller.server.start(options)
        })
    )
