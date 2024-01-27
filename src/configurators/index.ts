import FeatureIDE from '#configurators/feature-ide'
import YAML from '#configurators/yaml'
import {InputAssignmentMap} from '#spec/topology-template'

export interface Configurator {
    load: (file: string) => Promise<InputAssignmentMap>
}

export default {
    get: getConfigurator,
}

function getConfigurator(file: string) {
    if (file.endsWith('.xml')) return new FeatureIDE()
    return new YAML()
}
