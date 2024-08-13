import Controller from '#controller'
import {benchmark2latex, benchmark2markdown} from '#controller/setup/benchmark'
import env from '#env'
import * as files from '#files'
import {UnfurlNativeDefaults, UnfurlWSLDefaults} from '#orchestrators/unfurl'
import {xOperaNativeDefaults, xOperaWSLDefaults} from '#orchestrators/xopera'
import std from '#std'
import hae from '#utils/hae'
import open from '#utils/open'
import {Command, Option} from 'commander'

export const program = new Command()

program.name('vintner').version(env.version)
    .description(`OpenTOSCA Vintner is a TOSCA preprocessing and management layer which is able to deploy applications based on TOSCA orchestrator plugins. Preprocessing includes, e.g., the resolving of deployment variability.

Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its Contributions) on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including, without limitation, any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A PARTICULAR PURPOSE. You are solely responsible for determining the appropriateness of using or redistributing the Work and assume any risks associated with Your exercise of permissions under this License.`)

/**
 * Setup
 */
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
    .option('--no-force [boolean]')
    .action(
        hae.exit(async options => {
            await Controller.setup.clean(options)
        })
    )

setup
    .command('reset')
    .description('resets the filesystem')
    .option('--force [boolean]', 'force clean up')
    .option('--no-force [boolean]')
    .action(
        hae.exit(async options => {
            await Controller.setup.reset(options)
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
            std.out(await Controller.setup.path())
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
            std.table(results)
            if (options.markdown) std.out('\n', benchmark2markdown(results, options))
            if (options.latex) std.out('\n', benchmark2latex(results, options))
        })
    )

/**
 * Info
 */
const info = program.command('info').description('infos about vintner')

info.command('about')
    .description('general information')
    .action(
        hae.exit(async options => {
            std.out(await Controller.info.about())
        })
    )

info.command('license')
    .description('license of vintner')
    .action(
        hae.exit(async options => {
            std.out(await Controller.info.license())
        })
    )

info.command('author')
    .description('open author')
    .action(
        hae.exit(async options => {
            const url = await Controller.info.author()
            await open.url(url)
        })
    )

info.command('contact')
    .description('contact us')
    .action(
        hae.exit(async options => {
            const url = await Controller.info.contact()
            await open.url(url)
        })
    )

info.command('docs')
    .description('open documentation')
    .action(
        hae.exit(async options => {
            const url = await Controller.info.docs()
            await open.url(url)
        })
    )

info.command('repo')
    .description('open repository')
    .action(
        hae.exit(async options => {
            const url = await Controller.info.repo()
            await open.url(url)
        })
    )

info.command('dependencies')
    .description('dependencies used to implement vintner')
    .action(
        hae.exit(async options => {
            std.out(await Controller.info.dependencies())
        })
    )

/**
 * Install
 */
const install = program.command('install').description('installs utils (Linux is required)')

install
    .command('ansible')
    .description('installs Ansible')
    .action(
        hae.exit(async options => {
            await Controller.install.ansible(options)
        })
    )

install
    .command('docker')
    .description('installs Docker')
    .action(
        hae.exit(async options => {
            await Controller.install.docker(options)
        })
    )

install
    .command('gcloud')
    .description('installs GCloud')
    .action(
        hae.exit(async options => {
            await Controller.install.gcloud(options)
        })
    )

install
    .command('python')
    .description('installs Python')
    .action(
        hae.exit(async options => {
            await Controller.install.python(options)
        })
    )

install
    .command('terraform')
    .description('installs Terraform')
    .action(
        hae.exit(async options => {
            await Controller.install.terraform(options)
        })
    )

install
    .command('unfurl')
    .description('installs Unfurl in a venv in "' + UnfurlNativeDefaults.dir + '"')
    .action(
        hae.exit(async options => {
            await Controller.install.unfurl(options)
        })
    )

install
    .command('utils')
    .description('installs utils, such as sudo, unzip, git ...')
    .action(
        hae.exit(async options => {
            await Controller.install.utils(options)
        })
    )

install
    .command('xopera')
    .description('installs xOpera in a venv in "' + xOperaNativeDefaults.dir + '"')
    .action(
        hae.exit(async options => {
            await Controller.install.xopera(options)
        })
    )

install
    .command('platformio')
    .description('installs PlatformIO Core CLI')
    .action(
        hae.exit(async options => {
            await Controller.install.platformio(options)
        })
    )

/**
 * Orchestrators
 */
const orchestrators = program.command('orchestrators').description('configures orchestrators')

orchestrators
    .command('enable')
    .description('enables an orchestrator plugin')
    .requiredOption('--orchestrator <string>', 'orchestrator')
    .action(
        hae.exit(async options => {
            await Controller.orchestrators.enable(options)
        })
    )

orchestrators
    .command('attest')
    .description('attests an orchestrator plugin')
    .requiredOption('--orchestrator <string>', 'orchestrator')
    .action(
        hae.exit(async options => {
            await Controller.orchestrators.attest(options)
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

/**
 * Template
 */
const template = program.command('template').description('handles stand-alone variable service templates')

template
    .command('init')
    .description('initializes a CSAR')
    .requiredOption('--path <string>', 'path of the directory')
    .option('--template <string>', 'template name (default: directory name of --path)')
    .option('--vintner <string>', 'vintner binary to execute', 'task cli --')
    .option('--force [boolean]', 'force initialization, e.g., on non-empty directories')
    .option('--no-force [boolean]')
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
    .command('enrich')
    .description('enrich conditions')
    .requiredOption('--template <string>', 'path to variable service template')
    .requiredOption('--output <string>', 'path of the output')
    .action(
        hae.exit(async options => {
            await Controller.template.enrich(options)
        })
    )

template
    .command('normalize')
    .description('normalize service template')
    .requiredOption('--template <string>', 'path to variable service template')
    .requiredOption('--output <string>', 'path of the output')
    .action(
        hae.exit(async options => {
            await Controller.template.enrich(options)
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
    .description('collects stats of a given service template (experimental)')
    .requiredOption('--template <strings...>', 'path to service template')
    .requiredOption('--experimental', 'enable experimental feature')
    .action(
        hae.exit(async options => {
            const result = await Controller.template.stats(options)
            std.out(result)
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

template
    .command('sign')
    .description('signs a CSAR')
    .requiredOption('--template <string>', 'path to service template')
    .option('--output <string>', 'path of the output (default: template path + ".asc" )')
    .requiredOption('--key <string>', 'path of the key')
    .action(
        hae.exit(async options => {
            await Controller.template.sign(options)
        })
    )

template
    .command('verify')
    .description('verify a CSAR')
    .requiredOption('--template <string>', 'path to service template')
    .option('--signature <string>', 'path of the signature (default: template path + ".asc" )')
    .requiredOption('--key <string>', 'path of the key')
    .action(
        hae.exit(async options => {
            await Controller.template.verify(options)
        })
    )

template
    .command('pull')
    .description('pull template dependencies')
    .requiredOption('--dir <string>', 'path to service template directory')
    .option('--link [boolean]', 'create symbolic links instead of copying files', false)
    .option('--no-link [boolean]')
    .action(
        hae.exit(async options => {
            await Controller.template.pull(options)
        })
    )

template
    .command('quality')
    .description('get quality of template (experimental)')
    .requiredOption('--experimental', 'enable experimental feature')
    .requiredOption('--template <string>', 'path to service template')
    .option('--presets [string...]', 'names of variability presets(env: OPENTOSCA_VINTNER_VARIABILITY_PRESETS)', [])
    .option(
        '--inputs [string]',
        'path to the variability inputs (supported: [YAML, FeatureIDE ExtendedXML], env: OPENTOSCA_VINTNER_VARIABILITY_INPUT_${KEY})'
    )
    .action(
        hae.exit(async options => {
            std.out(await Controller.template.quality(options))
        })
    )

template
    .command('unpull')
    .description('unpull template dependencies')
    .requiredOption('--dir <string>', 'path to service template directory')
    .action(
        hae.exit(async options => {
            await Controller.template.unpull(options)
        })
    )

template
    .command('implement')
    .description('implement node types')
    .requiredOption('--dir <string>', 'path to service template directory')
    .action(
        hae.exit(async options => {
            await Controller.template.implement(options)
        })
    )

template
    .command('unimplement')
    .description('unimplement node types')
    .requiredOption('--dir <string>', 'path to service template directory')
    .action(
        hae.exit(async options => {
            await Controller.template.unimplement(options)
        })
    )

const puml = template.command('puml').description('generate puml')

puml.command('topology')
    .description('plot topology as PlantUML')
    .requiredOption('--path <string>', 'path to service template')
    .option('--output [string]', 'path of the output')
    .action(
        hae.exit(async options => {
            await Controller.template.puml.topology(options)
        })
    )

puml.command('types')
    .description('plot types as PlantUML (each entity types is plotted separately)')
    .requiredOption('--path <string>', 'path to service template')
    .option('--output [string]', 'path of the output directory (default: the directory of the service template)')
    .option('--types [string...]', 'entity types to consider, e.g., "node_types" (default: Every defined entity type)')
    .action(
        hae.exit(async options => {
            await Controller.template.puml.types(options)
        })
    )

/**
 * Templates
 */
const templates = program.command('templates').description('handles templates repository')

templates
    .command('list')
    .description('lists all templates')
    .action(
        hae.exit(async () => {
            const templates = await Controller.templates.list()
            std.out(templates.map(template => template.getName()).join('\n'))
        })
    )

templates
    .command('import')
    .description('imports a new template')
    .requiredOption('--template <string>', 'template name')
    .requiredOption('--path <string>', 'path or link to the CSAR')
    .option('--git-repository [string]', 'git repository')
    .option('--git-checkout [string]', 'git checkout')
    .option('--signature', 'path to the signature (default: template + ".asc")')
    .option('--key', 'assets name to verify the signature')
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
            std.out(await Controller.templates.path(options))
        })
    )

templates
    .command('inspect')
    .description('inspects the variable service template')
    .requiredOption('--template <string>', 'template name')
    .action(
        hae.exit(async options => {
            const template = await Controller.templates.inspect(options)
            std.out(files.toYAML(template))
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

/**
 * Instances
 */
const instances = program.command('instances').description('handles instances')

instances
    .command('list')
    .description('lists all instances')
    .action(
        hae.exit(async () => {
            const instances = await Controller.instances.list()
            std.out(instances.map(it => it.getName()).join('\n'))
        })
    )

instances
    .command('init')
    .description('initializes a new instance')
    .requiredOption('--instance <string>', 'instance name (must match /^[a-z\\-]+$/)')
    .requiredOption('--template <string>', 'template name')
    .option('--force [boolean]', 'force', false)
    .option('--no-force [boolean]')
    .option('--lock [boolean]', 'enable instance locking', true)
    .option('--no-lock [boolean]')
    .option('--machine [boolean]', 'enable state machine', true)
    .option('--no-machine [boolean]')
    .action(
        hae.exit(async options => {
            await Controller.instances.init(options)
        })
    )

instances
    .command('info')
    .description('display instance info')
    .requiredOption('--instance <string>', 'instance name')
    .option('--force [boolean]', 'force', false)
    .option('--no-force [boolean]')
    .option('--lock [boolean]', 'enable instance locking', true)
    .option('--no-lock [boolean]')
    .option('--machine [boolean]', 'enable state machine', true)
    .option('--no-machine [boolean]')
    .action(
        hae.exit(async options => {
            const info = await Controller.instances.info(options)
            std.out(files.toYAML(info))
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
            std.out(await Controller.instances.path(options))
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
    .option('--force [boolean]', 'force', false)
    .option('--no-force [boolean]')
    .option('--lock [boolean]', 'enable instance locking', true)
    .option('--no-lock [boolean]')
    .option('--machine [boolean]', 'enable state machine', true)
    .option('--no-machine [boolean]')
    .action(
        hae.exit(async options => {
            await Controller.instances.resolve(options)
        })
    )

instances
    .command('validate')
    .description('validates variability-resolved service template')
    .requiredOption('--instance <string>', 'instance name')
    .option('--inputs [string]', 'path to the deployment inputs')
    .option('--verbose [boolean]', 'verbose')
    .option('--no-verbose [boolean]')
    .option('--dry [boolean]', 'dry run')
    .option('--no-dry [boolean]')
    .option('--force [boolean]', 'force', false)
    .option('--no-force [boolean]')
    .option('--lock [boolean]', 'enable instance locking', true)
    .option('--no-lock [boolean]')
    .option('--machine [boolean]', 'enable state machine', true)
    .option('--no-machine [boolean]')
    .action(
        hae.exit(async options => {
            await Controller.instances.validate(options)
        })
    )

instances
    .command('inspect')
    .description('inspects variability-resolved service template')
    .requiredOption('--instance <string>', 'instance name')
    .option('--force [boolean]', 'force', false)
    .option('--no-force [boolean]')
    .option('--lock [boolean]', 'enable instance locking', true)
    .option('--no-lock [boolean]')
    .option('--machine [boolean]', 'enable state machine', true)
    .option('--no-machine [boolean]')
    .action(
        hae.exit(async options => {
            const template = await Controller.instances.inspect(options)
            std.out(files.toYAML(template))
        })
    )

instances
    .command('deploy')
    .description('deploys instance')
    .requiredOption('--instance <string>', 'instance name')
    .option('--inputs [string]', 'path to the deployment inputs (env: OPENTOSCA_VINTNER_DEPLOYMENT_INPUT_${KEY})')
    .option('--retries [boolean]', 'number of retries', '3')
    .option('--verbose [boolean]', 'verbose')
    .option('--no-verbose [boolean]')
    .option('--force [boolean]', 'force', false)
    .option('--no-force [boolean]')
    .option('--lock [boolean]', 'enable instance locking', true)
    .option('--no-lock [boolean]')
    .option('--machine [boolean]', 'enable state machine', true)
    .option('--no-machine [boolean]')
    .action(
        hae.exit(async options => {
            await Controller.instances.deploy(options)
        })
    )

instances
    .command('outputs')
    .description('returns instance outputs')
    .requiredOption('--instance <string>', 'instance name')
    .option('--verbose [boolean]', 'verbose')
    .option('--no-verbose [boolean]')
    .option('--force [boolean]', 'force', false)
    .option('--no-force [boolean]')
    .option('--lock [boolean]', 'enable instance locking', true)
    .option('--no-lock [boolean]')
    .option('--machine [boolean]', 'enable state machine', true)
    .option('--no-machine [boolean]')
    .action(
        hae.exit(async options => {
            await Controller.instances.outputs(options)
        })
    )

instances
    .command('continue')
    .description('continue instance (deployment)')
    .requiredOption('--instance <string>', 'instance name')
    .option('--verbose [boolean]', 'verbose')
    .option('--no-verbose [boolean]')
    .option('--force [boolean]', 'force', false)
    .option('--no-force [boolean]')
    .option('--lock [boolean]', 'enable instance locking', true)
    .option('--no-lock [boolean]')
    .option('--machine [boolean]', 'enable state machine', true)
    .option('--no-machine [boolean]')
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
    .option('--no-verbose [boolean]')
    .option('--force [boolean]', 'force', false)
    .option('--no-force [boolean]')
    .option('--lock [boolean]', 'enable instance locking', true)
    .option('--no-lock [boolean]')
    .option('--machine [boolean]', 'enable state machine', true)
    .option('--no-machine [boolean]')
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
    .option('--force [boolean]', 'force', false)
    .option('--no-force [boolean]')
    .option('--lock [boolean]', 'enable instance locking', true)
    .option('--no-lock [boolean]')
    .option('--machine [boolean]', 'enable state machine', true)
    .option('--no-machine [boolean]')
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
    .option('--no-verbose [boolean]')
    .option('--force [boolean]', 'force', false)
    .option('--no-force [boolean]')
    .option('--lock [boolean]', 'enable instance locking', true)
    .option('--no-lock [boolean]')
    .option('--machine [boolean]', 'enable state machine', true)
    .option('--no-machine [boolean]')
    .action(
        hae.exit(async options => {
            await Controller.instances.undeploy(options)
        })
    )

instances
    .command('delete')
    .description('deletes instance')
    .requiredOption('--instance <string>', 'instance name')
    .option('--force [boolean]', 'force', false)
    .option('--no-force [boolean]')
    .option('--lock [boolean]', 'enable instance locking', true)
    .option('--no-lock [boolean]')
    .option('--machine [boolean]', 'enable state machine', true)
    .option('--no-machine [boolean]')
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

instances
    .command('debug')
    .description('debug utility that passes a command into the orchestrator in scope of the instance')
    .requiredOption('--instance <string>', 'instance name')
    .requiredOption('--command <string>', 'command')
    .option('--force [boolean]', 'force', false)
    .option('--no-force [boolean]')
    .option('--lock [boolean]', 'enable instance locking', true)
    .option('--no-lock [boolean]')
    .option('--machine [boolean]', 'enable state machine', true)
    .option('--no-machine [boolean]')
    .action(
        hae.exit(async options => {
            await Controller.instances.debug(options)
        })
    )

instances
    .command('state')
    .description('set the state of the instance')
    .requiredOption('--instance <string>', 'instance name')
    .requiredOption('--state <string>', 'state')
    .option('--force [boolean]', 'force', false)
    .option('--no-force [boolean]')
    .option('--lock [boolean]', 'enable instance locking', true)
    .option('--no-lock [boolean]')
    .action(
        hae.exit(async options => {
            await Controller.instances.state(options)
        })
    )

/**
 * Server
 */
const server = program.command('server').description('handles the server')

server
    .command('start')
    .description('starts the server')
    .option('--host [string]', 'host on which to listen', '127.0.0.1')
    .option('--port [number]', 'port on which to listen', '3000')
    .action(
        hae.exit(async options => {
            await Controller.server.start(options)
        })
    )

/**
 * Sensors
 */
const sensors = program.command('sensors').description('handles sensors')

sensors
    .command('compute')
    .description('starts a sensor for compute utilization, such as cpu and memory')
    .requiredOption('--instance <string>', 'monitored instance')
    .requiredOption('--template <string>', 'node template name')
    .option('--vintner [string]', 'vintner address to submit sensors data', 'http://127.0.0.1:3000')
    .option('--time-interval [string]', 'interval to submit data', 'every 10 seconds')
    .option('--submission [boolean]', 'send data', true)
    .option('--no-submission [boolean]')
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
    .option('--submission [boolean]', 'send data', true)
    .option('--no-submission [boolean]')
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
    .option('--submission [boolean]', 'send data', true)
    .option('--no-submission [boolean]')
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
    .option('--watch [boolean]', 'watch file and send changes', true)
    .option('--no-watch [boolean]')
    .option('--submission [boolean]', 'send data', true)
    .option('--no-submission [boolean]')
    .action(
        hae.exit(async options => {
            await Controller.sensors.file(options)
        })
    )

/**
 * Assets
 */
const assets = program.command('assets').description('manages assets')

assets
    .command('list')
    .description('lists all assets')
    .action(
        hae.exit(async options => {
            const assets = await Controller.assets.list()
            std.out(assets.map(it => it.getName()).join('\n'))
        })
    )

assets
    .command('import')
    .description('imports an asset')
    .requiredOption('--name <string>', 'name (must match /^[a-z\\-]+$/)')
    .option('--file <string>', 'path to a file')
    .option('--content <string>', 'content to import')
    .action(
        hae.exit(async options => {
            await Controller.assets.import(options)
        })
    )

assets
    .command('content')
    .description('shows content of an asset')
    .requiredOption('--name <string>', 'name')
    .action(
        hae.exit(async options => {
            const content = await Controller.assets.content(options)
            std.out(content)
        })
    )

assets
    .command('delete')
    .description('deletes an asset')
    .requiredOption('--name <string>', 'name')
    .action(
        hae.exit(async options => {
            await Controller.assets.delete(options)
        })
    )

assets
    .command('clean')
    .description('cleans all assets')
    .action(
        hae.exit(async options => {
            await Controller.assets.clean(options)
        })
    )

/**
 * Utils
 */
const utils = program.command('utils').description('some utilities')

utils
    .command('nonce')
    .description('generates a nonce')
    .action(
        hae.exit(async options => {
            const password = await Controller.utils.nonce(options)
            std.out(password)
        })
    )

utils
    .command('key')
    .description('generates a key')
    .requiredOption('--key <string>', 'key name (must match /^[a-z\\-]+$/)')
    .action(
        hae.exit(async options => {
            await Controller.utils.key(options)
        })
    )

/**
 * Query
 */
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
            if (options.format === 'yaml') std.out(files.toYAML(result))
            if (options.format === 'json') std.out(files.toJSON(result))
        })
    )
