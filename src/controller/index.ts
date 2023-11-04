import InfoController from './info'
import InstancesController from './instances'
import KeystoreController from './keystore'
import OrchestratorsController from './orchestrators'
import QueryController from './query'
import SensorsController from './sensors'
import ServerController from './server'
import SetupController from './setup'
import TemplateController from './template'
import TemplatesController from './templates'

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
    keystore: KeystoreController,
}
