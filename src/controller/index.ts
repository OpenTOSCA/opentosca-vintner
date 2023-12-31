import AssetsController from './assets'
import InfoController from './info'
import InstallController from './install'
import InstancesController from './instances'
import OrchestratorsController from './orchestrators'
import QueryController from './query'
import SensorsController from './sensors'
import ServerController from './server'
import SetupController from './setup'
import TemplateController from './template'
import TemplatesController from './templates'
import UtilsController from './utils'

export default {
    info: InfoController,
    install: InstallController,
    instances: InstancesController,
    query: QueryController,
    orchestrators: OrchestratorsController,
    server: ServerController,
    setup: SetupController,
    template: TemplateController,
    templates: TemplatesController,
    sensors: SensorsController,
    assets: AssetsController,
    utils: UtilsController,
}
