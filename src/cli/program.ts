import config from '#config'
import Controller from '#controller'
import {benchmark2latex, benchmark2markdown} from '#controller/setup/benchmark'
import * as files from '#files'
import {UnfurlNativeDefaults, UnfurlWSLDefaults} from '#plugins/unfurl'
import {xOperaNativeDefaults, xOperaWSLDefaults} from '#plugins/xopera'
import hae from '#utils/hae'
import {Command, Option} from 'commander'
import console from 'console'

export const program = new Command()

program.name('vintner').version(config.version)
    .description(`OpenTOSCA Vintner is a TOSCA preprocessing and management layer which is able to deploy applications based on TOSCA orchestrator plugins. Preprocessing includes, e.g., the resolving of deployment variability.

Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its Contributions) on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including, without limitation, any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A PARTICULAR PURPOSE. You are solely responsible for determining the appropriateness of using or redistributing the Work and assume any risks associated with Your exercise of permissions under this License.`)

const setup = program.command('setup').description('setups the filesystem')

setup
    .command('init')
    .description('initialises the filesystem')
    .action(
        hae.exit(async () => {
            await Controller.setup.init()
        })
    )

setup
    .command('clean')
    .description('cleans up the filesystem')
    .option('--force [boolean]', 'force clean up')
    .action(
        hae.exit(async options => {
            await Controller.setup.clean(options)
        })
    )

setup
    .command('open')
    .description('opens the home directory')
    .action(
        hae.exit(async () => {
            await Controller.setup.open()
        })
    )

setup
    .command('code')
    .description('opens the home directory in visual studio code')
    .action(
        hae.exit(async () => {
            await Controller.setup.code()
        })
    )

setup
    .command('path')
    .description('returns the path to the home directory')
    .action(
        hae.exit(async () => {
            console.log(await Controller.setup.path())
        })
    )

setup
    .command('utils')
    .description('install utils (linux is required)')
    .option('--all [boolean]', 'install all utils')
    .option('--git [boolean]', 'install Git')
    .option('--python [boolean]', 'install Python')
    .option('--xopera [boolean]', 'install xOpera (system-wide)')
    .option('--unfurl [boolean]', 'install Unfurl (system-wide)')
    .option('--gcloud [boolean]', 'install gCloud')
    .option('--terraform [boolean]', 'install Terraform')
    .option('--ansible [boolean]', 'install Ansible (system-wide)')
    .action(
        hae.exit(async options => {
            console.log(await Controller.setup.utils(options))
        })
    )

setup
    .command('benchmark')
    .description('benchmarks the variability resolver')
    .option('--io [boolean]', 'enable read and writes to the filesystem')
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
        hae.exit(async options => {
            const results = await Controller.setup.benchmark(options)
            console.table(results)
            if (options.markdown) console.log('\n', benchmark2markdown(results, options))
            if (options.latex) console.log('\n', benchmark2latex(results, options))
        })
    )

const info = program.command('info').description('infos about vintner')

info.command('about')
    .description('general information')
    .action(
        hae.exit(async options => {
            await Controller.info.about()
        })
    )

info.command('license')
    .description('license of vintner')
    .action(
        hae.exit(async options => {
            await Controller.info.license()
        })
    )

info.command('author')
    .description('open author')
    .action(
        hae.exit(async options => {
            await Controller.info.author()
        })
    )

info.command('contact')
    .description('contact us')
    .action(
        hae.exit(async options => {
            await Controller.info.contact()
        })
    )

info.command('docs')
    .description('open documentation')
    .action(
        hae.exit(async options => {
            await Controller.info.docs()
        })
    )

info.command('repo')
    .description('open repository')
    .action(
        hae.exit(async options => {
            await Controller.info.repo()
        })
    )

info.command('dependencies')
    .description('dependencies used to implement vintner')
    .action(
        hae.exit(async options => {
            await Controller.info.dependencies()
        })
    )

const orchestrators = program.command('orchestrators').description('configures orchestrators')

orchestrators
    .command('enable')
    .description('enables an orchestrator plugin')
    .requiredOption('--orchestrator <string>', 'orchestrator plugin')
    .action(
        hae.exit(async options => {
            await Controller.orchestrators.enable(options)
        })
    )

const initOrchestrators = orchestrators.command('init').description('initializes an orchestrator plugin')

initOrchestrators
    .command('xopera')
    .description('initializes xopera plugin')
    .option('--venv [boolean]', 'enable the use of a virtual environment', xOperaNativeDefaults.venv)
    .option('--no-venv [boolean]', 'disable the use of a virtual environment')
    .option('--dir [string]', 'directory of xopera', xOperaNativeDefaults.dir)
    .action(
        hae.exit(async options => {
            await Controller.orchestrators.initxOpera(options)
        })
    )

initOrchestrators
    .command('xopera-wsl')
    .description('initializes xopera-wsl plugin')
    .option('--venv [boolean]', 'enable the use of a virtual environment', xOperaWSLDefaults.venv)
    .option('--no-venv [boolean]', 'enable the use of a virtual environment')
    .option('--dir [string]', 'directory of opera', xOperaWSLDefaults.dir)
    .action(
        hae.exit(async options => {
            await Controller.orchestrators.initxOperaWSL(options)
        })
    )

initOrchestrators
    .command('unfurl')
    .description('initializes unfurl plugin')
    .option('--venv [boolean]', 'enable the use of a virtual environment', UnfurlNativeDefaults.venv)
    .option('--no-venv [boolean]', 'disable the use of a virtual environment')
    .option('--dir [string]', 'directory of unfurl', UnfurlNativeDefaults.dir)
    .action(
        hae.exit(async options => {
            await Controller.orchestrators.initUnfurl(options)
        })
    )

initOrchestrators
    .command('unfurl-wsl')
    .description('initializes unfurl-wsl plugin')
    .option('--venv [boolean]', 'enable the use of a virtual environment', UnfurlWSLDefaults.venv)
    .option('--no-venv [boolean]', 'disable the use of a virtual environment')
    .option('--dir [string]', 'directory of unfurl', UnfurlWSLDefaults.dir)
    .action(
        hae.exit(async options => {
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
        hae.exit(async options => {
            const result = await Controller.query.run(options)
            if (options.format === 'yaml') console.log(files.toYAML(result))
            if (options.format === 'json') console.log(files.toJSON(result))
        })
    )

const template = program.command('template').description('handles stand-alone variable service templates')

template
    .command('init')
    .description('initializes a CSAR')
    .requiredOption('--path <string>', 'path of the directory')
    .option('--template <string>', 'template name (default: directory name of --path)')
    .option('--vintner <string>', 'vintner binary to execute', 'yarn cli')
    .option('--force [boolean]', 'force initialization, e.g., on non-empty directories')
    .action(
        hae.exit(async options => {
            await Controller.template.init(options)
        })
    )

template
    .command('package')
    .description('packages a directory to a CSAR')
    .requiredOption('--template <string>', 'path to variable service template')
    .requiredOption('--output <string>', 'path of the output')
    .action(
        hae.exit(async options => {
            await Controller.template.package(options)
        })
    )

template
    .command('unpackage')
    .description('unpackages a CSAR')
    .requiredOption('--template <string>', 'path to variable service template')
    .requiredOption('--output <string>', 'path of the output')
    .action(
        hae.exit(async options => {
            await Controller.template.unpackage(options)
        })
    )

template
    .command('resolve')
    .description('resolves variability')
    .requiredOption('--template <string>', 'path to variable service template')
    .option('--presets [strings...]', 'names of variability presets (env: OPENTOSCA_VINTNER_VARIABILITY_PRESETS)', [])
    .option(
        '--inputs [string]',
        'path to the variability inputs (supported: [YAML, FeatureIDE ExtendedXML, env: OPENTOSCA_VINTNER_VARIABILITY_INPUT_<NAME>)'
    )
    .requiredOption('--output <string>', 'path of the output')
    .action(
        hae.exit(async options => {
            await Controller.template.resolve(options)
        })
    )

template
    .command('query')
    .description('resolves all queries in a given service template')
    .requiredOption('--template <string>', 'path to service template')
    .requiredOption('--output <string>', 'path of the output')
    .action(
        hae.exit(async options => {
            Controller.template.query(options)
        })
    )

template
    .command('stats')
    .description('collects stats of a given service template')
    .requiredOption('--template <strings...>', 'path to service template')
    .action(
        hae.exit(async options => {
            const result = await Controller.template.stats(options)
            console.log(result)
        })
    )

template
    .command('test')
    .description('runs tests defined in the CSAR')
    .requiredOption('--path <string>', 'path or link to the extracted CSAR')
    .action(
        hae.exit(async options => {
            await Controller.template.test(options)
        })
    )

template
    .command('inputs')
    .description('read and transforms inputs')
    .requiredOption('--path <string>', 'path to the variability inputs (supported: [YAML, FeatureIDE ExtendedXML])')
    .requiredOption('--output <string>', 'path of the output')
    .action(
        hae.exit(async options => {
            await Controller.template.inputs(options)
        })
    )

const puml = template.command('puml').description('generate puml')

const pumlTopology = puml
    .command('topology')
    .description('plot topology as PlantUML')
    .requiredOption('--path <string>', 'path to service template')
    .option('--output [string]', 'path of the output')
    .action(
        hae.exit(async options => {
            await Controller.template.puml.topology(options)
        })
    )

const pumlTypes = puml
    .command('types')
    .description('plot types as PlantUML (each entity types is plotted separately)')
    .requiredOption('--path <string>', 'path to service template')
    .option('--output [string]', 'path of the output directory (default: the directory of the service template')
    .option('--types [string...]', 'entity types to consider, e.g., "node_types" (default: Every defined entity type)')
    .action(
        hae.exit(async options => {
            await Controller.template.puml.types(options)
        })
    )

const templates = program.command('templates').description('handles templates repository')

templates
    .command('list')
    .description('lists all templates')
    .action(
        hae.exit(async () => {
            const templates = await Controller.templates.list()
            console.log(templates.map(template => template.getName()).join('\n'))
        })
    )

templates
    .command('import')
    .description('imports a new template')
    .requiredOption('--template <string>', 'template name')
    .requiredOption('--path <string>', 'path or link to the CSAR')
    .option('--git-repository [string]', 'git repository')
    .option('--git-checkout [string]', 'git checkout')
    .action(
        hae.exit(async options => {
            await Controller.templates.import(options)
        })
    )

templates
    .command('open')
    .description('opens template directory in a file browser')
    .requiredOption('--template <string>', 'template name')
    .action(
        hae.exit(async options => {
            await Controller.templates.open(options)
        })
    )

templates
    .command('code')
    .description('opens the template directory in visual studio code')
    .requiredOption('--template <string>', 'template name')
    .action(
        hae.exit(async options => {
            await Controller.templates.code(options)
        })
    )

templates
    .command('path')
    .description('returns the path to the template directory')
    .requiredOption('--template <string>', 'template name')
    .action(
        hae.exit(async options => {
            console.log(await Controller.templates.path(options))
        })
    )

templates
    .command('inspect')
    .description('inspects the variable service template')
    .requiredOption('--template <string>', 'template name')
    .action(
        hae.exit(async options => {
            const template = await Controller.templates.inspect(options)
            console.log(files.toYAML(template))
        })
    )

templates
    .command('delete')
    .description('deletes a template')
    .requiredOption('--template <string>', 'template name')
    .action(
        hae.exit(async options => {
            await Controller.templates.delete(options)
        })
    )

templates
    .command('clean')
    .description('removes all templates')
    .action(
        hae.exit(async options => {
            await Controller.templates.clean(options)
        })
    )

const instances = program.command('instances').description('handles instances')

instances
    .command('list')
    .description('lists all instances')
    .action(
        hae.exit(async () => {
            const instances = await Controller.instances.list()
            console.log(instances.map(instance => instance.getName()).join('\n'))
        })
    )

instances
    .command('init')
    .description('initializes a new instance')
    .requiredOption('--instance <string>', 'instance name (must match /^[a-z\\-]+$/)')
    .requiredOption('--template <string>', 'template name')
    .action(
        hae.exit(async options => {
            await Controller.instances.init(options)
        })
    )

instances
    .command('info')
    .description('display instance info')
    .requiredOption('--instance <string>', 'instance name')
    .action(
        hae.exit(async options => {
            const info = await Controller.instances.info(options)
            console.log(files.toYAML(info))
        })
    )

instances
    .command('open')
    .description('opens template directory in a file browser')
    .requiredOption('--instance <string>', 'instance name')
    .action(
        hae.exit(async options => {
            await Controller.instances.open(options)
        })
    )

instances
    .command('code')
    .description('opens the instance directory in visual studio code')
    .requiredOption('--instance <string>', 'instance name')
    .action(
        hae.exit(async options => {
            await Controller.instances.code(options)
        })
    )

instances
    .command('path')
    .description('returns the path to the instance directory')
    .requiredOption('--instance <string>', 'instance name')
    .action(
        hae.exit(async options => {
            console.log(await Controller.instances.path(options))
        })
    )

instances
    .command('resolve')
    .description('resolves variability')
    .requiredOption('--instance <string>', 'instance name')
    .option('--presets [string...]', 'names of variability presets(env: OPENTOSCA_VINTNER_VARIABILITY_PRESETS)', [])
    .option(
        '--inputs [string]',
        'path to the variability inputs (supported: [YAML, FeatureIDE ExtendedXML], env: OPENTOSCA_VINTNER_VARIABILITY_INPUT_${KEY})'
    )
    .action(
        hae.exit(async options => {
            await Controller.instances.resolve(options)
        })
    )

instances
    .command('inspect')
    .description('inspects variability-resolved service template')
    .requiredOption('--instance <string>', 'instance name')
    .action(
        hae.exit(async options => {
            const template = await Controller.instances.inspect(options)
            console.log(files.toYAML(template))
        })
    )

instances
    .command('deploy')
    .description('deploys instance')
    .requiredOption('--instance <string>', 'instance name')
    .option('--inputs [string]', 'path to the deployment inputs (env: OPENTOSCA_VINTNER_DEPLOYMENT_INPUT_${KEY})')
    .option('--verbose [boolean]', 'verbose')
    .action(
        hae.exit(async options => {
            await Controller.instances.deploy(options)
        })
    )

instances
    .command('continue')
    .description('continue instance (deployment)')
    .requiredOption('--instance <string>', 'instance name')
    .option('--verbose [boolean]', 'verbose')
    .action(
        hae.exit(async options => {
            await Controller.instances.continue(options)
        })
    )

instances
    .command('update')
    .description('update instance')
    .requiredOption('--instance <string>', 'instance name')
    .option('--inputs [string]', 'path to the deployment inputs (env: OPENTOSCA_VINTNER_DEPLOYMENT_INPUT_${KEY})')
    .option('--verbose [boolean]', 'verbose')
    .action(
        hae.exit(async options => {
            await Controller.instances.update(options)
        })
    )

instances
    .command('swap')
    .description('swap instance template')
    .requiredOption('--instance <string>', 'instance name')
    .requiredOption('--template <string>', 'template name')
    .action(
        hae.exit(async options => {
            await Controller.instances.swap(options)
        })
    )

instances
    .command('undeploy')
    .description('undeploys instance')
    .requiredOption('--instance <string>', 'instance name')
    .option('--verbose [boolean]', 'verbose')
    .action(
        hae.exit(async options => {
            await Controller.instances.undeploy(options)
        })
    )

instances
    .command('delete')
    .description('deletes instance')
    .requiredOption('--instance <string>', 'instance name')
    .action(
        hae.exit(async options => {
            await Controller.instances.delete(options)
        })
    )

instances
    .command('clean')
    .description('deletes all instances')
    .action(
        hae.exit(async options => {
            await Controller.instances.clean(options)
        })
    )

const server = program.command('server').description('handles the server')

server
    .command('start')
    .description('starts the server')
    .option('--host [string]', 'host on which to listen', '127.0.0.1')
    .option('--port [number}', 'port on which to listen', '3000')
    .action(
        hae.exit(async options => {
            await Controller.server.start(options)
        })
    )

const sensors = program.command('sensors').description('handles sensors')

sensors
    .command('compute')
    .description('starts a sensor for compute utilization such as cpu and memory')
    .requiredOption('--instance <string>', 'monitored instance')
    .requiredOption('--template <string>', 'node template name')
    .option('--vintner [string]', 'vintner address to submit sensors data', 'http://127.0.0.1:3000')
    .option('--time-interval [string]', 'interval to submit data', 'every 10 seconds')
    .option('--disable-submission [boolean]', 'disable submission of data', false)
    .action(
        hae.exit(async options => {
            await Controller.sensors.compute(options)
        })
    )

sensors
    .command('location')
    .description('starts a sensor for the current location')
    .requiredOption('--instance <string>', 'monitored instance')
    .requiredOption('--template <string>', 'node template name')
    .option('--vintner [string]', 'vintner address to submit sensors data', 'http://127.0.0.1:3000')
    .option('--time-interval [string]', 'interval to submit data', 'every minute')
    .option('--disable-submission [boolean]', 'disable submission of data', false)
    .action(
        hae.exit(async options => {
            await Controller.sensors.location(options)
        })
    )

sensors
    .command('weekday')
    .description('starts a sensor for the weekday')
    .requiredOption('--instance <string>', 'monitored instance')
    .option('--vintner [string]', 'vintner address to submit sensors data', 'http://127.0.0.1:3000')
    .option('--time-interval [string]', 'interval to submit data', 'every day')
    .option('--start [string]', 'set day to start from')
    .option('--disable-submission [boolean]', 'disable submission of data', false)
    .action(
        hae.exit(async options => {
            await Controller.sensors.weekday(options)
        })
    )

sensors
    .command('file')
    .description('starts a sensor for data stored in a file')
    .requiredOption('--instance <string>', 'monitored instance')
    .requiredOption('--file <string>', 'path to file')
    .option('--vintner [string]', 'vintner address to submit sensors data', 'http://127.0.0.1:3000')
    .option('--time-interval [string]', 'interval to submit data', 'every 10 seconds')
    .option('--disable-watch [boolean]', 'do not watch file but send data once', false)
    .option('--disable-submission [boolean]', 'disable submission of data', false)
    .action(
        hae.exit(async options => {
            await Controller.sensors.file(options)
        })
    )
