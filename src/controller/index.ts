import AssetsController from './assets'
import InfoController from './info'
import InstallController from './install'
import InstancesController from './instances'
import OrchestratorsController from './orchestrators'
import QueryController from './query'
import SensorsController from './sensors'
import ServerController from './server'
import SetupController from './setup'
import TechnologiesController from './technologies'
import TemplateController from './template'
import TemplatesController from './templates'
import UtilsController from './utils'

export default {
    assets: AssetsController,
    info: InfoController,
    install: InstallController,
    instances: InstancesController,
    orchestrators: OrchestratorsController,
    query: QueryController,
    sensors: SensorsController,
    server: ServerController,
    setup: SetupController,
    template: TemplateController,
    templates: TemplatesController,
    technologies: TechnologiesController,
    utils: UtilsController,
}
