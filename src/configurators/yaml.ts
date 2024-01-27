import {Configurator} from '#configurators/index'
import * as files from '#files'
import {InputAssignmentMap} from '#spec/topology-template'

export default class YAML implements Configurator {
    async load(file: string) {
        return files.loadYAML<InputAssignmentMap>(file)
    }
}
