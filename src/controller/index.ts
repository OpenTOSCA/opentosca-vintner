import InfoController from './info'
import InstancesController from './instances'
import OrchestratorsController from './orchestrators'
import QueryController from './query'
import SensorsController from './sensors'
import ServerController from './server'
import SetupController from './setup'
import StoreController from './store'
import TemplateController from './template'
import TemplatesController from './templates'
import UtilsController from './utils'

export default {
    info: InfoController,
    instances: InstancesController,
    query: QueryController,
    orchestrators: OrchestratorsController,
    server: ServerController,
    setup: SetupController,
    template: TemplateController,
    templates: TemplatesController,
    sensors: SensorsController,
    store: StoreController,
    utils: UtilsController,
}
